type JsonRecord = Record<string, unknown>;

export type CatalogPersistenceRow = {
  legacy_id: number;
  sku: string | null;
  name_sr?: string | null;
  price_gross?: number | null;
  price_final_gross?: number | null;
  rebate_percent?: number | null;
  raw_payload: JsonRecord | null;
  [key: string]: unknown;
};

const ADMIN_RAW_KEYS = [
  "nameOverride",
  "hiddenFromShop",
  "categories",
  "commerceOverrides",
  "landing",
  "media",
  "declaration",
  "packageWeightKg",
  "washCareIcons",
  "seo",
  "productType",
  "shoe",
  "ananasExport",
  "forcedCategoryGroups",
  "excludedCategoryGroups",
] as const;

const asRecord = (value: unknown): JsonRecord =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};

const skuKey = (value: unknown) => String(value ?? "").trim().toUpperCase();

export const isMofficeManagedCatalogRow = (row: CatalogPersistenceRow) => {
  const payload = asRecord(row.raw_payload);
  if (payload.source === "manual" || payload.source === "admin") return false;
  const overrides = asRecord(payload.commerceOverrides);
  if (overrides.stock === true || overrides.inventory === true) return false;
  if (Object.keys(asRecord(payload.moffice)).length > 0) return true;
  if (payload.source === "moffice" || payload.syncSource === "legacy-stock-product.csv") return true;
  if (payload.legacyRaw || payload.stockWarehouses) return true;
  const sku = String(row.sku || "").trim();
  const ean = String(row.ean || "").trim();
  return /^\d{5,}$/.test(sku) || /^0\d{5,}$/.test(ean);
};

export const classifyCatalogRemovalRows = (rows: CatalogPersistenceRow[]) => {
  const mofficeSkus = new Set<string>();
  const manualLegacyIds: number[] = [];
  for (const row of rows) {
    const sku = String(row.sku || "").trim();
    if (sku && isMofficeManagedCatalogRow(row)) mofficeSkus.add(sku);
    else manualLegacyIds.push(Number(row.legacy_id));
  }
  return {
    mofficeSkus: Array.from(mofficeSkus).sort((a, b) => a.localeCompare(b, "sr", { numeric: true })),
    manualLegacyIds,
  };
};

/* Canonical JSON: sorted keys, undefined dropped — jsonb hands keys back in its own
   order, so a plain JSON.stringify comparison would call every row changed. */
const canonicalJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item ?? null)).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as JsonRecord;
    return `{${Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
};

/* Bookkeeping the sync stamps on every row it touches. Leaving these out of the
   comparison is the point: they change every run even when nothing else does. */
const withoutSyncStamps = (payload: unknown): JsonRecord => {
  const record = { ...asRecord(payload) };
  const moffice = { ...asRecord(record.moffice) };
  delete moffice.syncedAt;
  delete moffice.syncedRunId;
  if (Object.keys(asRecord(record.moffice)).length) record.moffice = moffice;
  return record;
};

const MOFFICE_NUMERIC_COLUMNS = [
  "tax_percent",
  "stock_warehouse_1",
  "stock_total",
  "price_net",
  "price_gross",
  "price_final_gross",
  "rebate_percent",
] as const;

/**
 * True when writing `planned` over `current` would change nothing but the sync
 * stamps. Every mOffice run used to rewrite all ~4k feed rows (and their TOASTed
 * raw_payload) even though only a handful of stocks move between runs, which is
 * what drained the Supabase Disk IO budget (Sept 2026).
 */
export const isMofficeRowUnchanged = (
  planned: CatalogPersistenceRow,
  current: CatalogPersistenceRow | undefined,
): boolean => {
  if (!current) return false;
  if (String(planned.sku ?? "") !== String(current.sku ?? "")) return false;
  if (String(planned.ean ?? "") !== String(current.ean ?? "")) return false;
  if (String(planned.name_sr ?? "") !== String(current.name_sr ?? "")) return false;
  if (Boolean(planned.is_active) !== Boolean(current.is_active)) return false;
  if (Boolean(planned.is_exported) !== Boolean(current.is_exported)) return false;
  for (const column of MOFFICE_NUMERIC_COLUMNS) {
    if (!(column in planned)) continue;
    if (Number(planned[column] ?? 0) !== Number(current[column] ?? 0)) return false;
  }
  return canonicalJson(withoutSyncStamps(planned.raw_payload)) === canonicalJson(withoutSyncStamps(current.raw_payload));
};

/**
 * Re-applies the latest admin-owned state immediately before an mOffice upsert.
 * The sync plan may be several seconds old; without this merge an admin save made
 * during that window can be overwritten by the plan's stale name/raw_payload.
 */
export const mergeFreshAdminStateIntoMofficeRows = <T extends CatalogPersistenceRow>(
  plannedRows: T[],
  currentRows: CatalogPersistenceRow[],
): T[] => {
  const currentById = new Map(currentRows.map((row) => [Number(row.legacy_id), row]));
  const modelNameBySku = new Map<string, string>();
  const hiddenSkus = new Set<string>();
  const manualPriceBySku = new Map<string, {
    priceGross: number;
    priceFinalGross: number;
    rebatePercent: number;
    updatedAt: string;
  }>();

  for (const row of currentRows) {
    const key = skuKey(row.sku);
    if (!key) continue;
    const payload = asRecord(row.raw_payload);
    const name = String(row.name_sr || "").trim();
    if (payload.nameOverride === true && name && !modelNameBySku.has(key)) modelNameBySku.set(key, name);
    if (payload.hiddenFromShop === true) hiddenSkus.add(key);
    const overrides = asRecord(payload.commerceOverrides);
    if (overrides.price === true) {
      const updatedAt = String(overrides.priceUpdatedAt || "");
      const currentPrice = manualPriceBySku.get(key);
      if (!currentPrice || updatedAt >= currentPrice.updatedAt) {
        manualPriceBySku.set(key, {
          priceGross: Number(row.price_gross ?? 0),
          priceFinalGross: Number(row.price_final_gross ?? 0),
          rebatePercent: Number(row.rebate_percent ?? 0),
          updatedAt,
        });
      }
    }
  }

  return plannedRows.map((planned) => {
    const current = currentById.get(Number(planned.legacy_id));
    const plannedPayload = asRecord(planned.raw_payload);
    const nextPayload: JsonRecord = { ...plannedPayload };

    if (current) {
      const currentPayload = asRecord(current.raw_payload);
      for (const key of ADMIN_RAW_KEYS) {
        if (Object.prototype.hasOwnProperty.call(currentPayload, key)) nextPayload[key] = currentPayload[key];
        else delete nextPayload[key];
      }

      const currentAttrs = asRecord(currentPayload.attributes);
      const plannedAttrs = asRecord(plannedPayload.attributes);
      if (Object.keys(currentAttrs).length || Object.keys(plannedAttrs).length) {
        nextPayload.attributes = { ...currentAttrs, ...plannedAttrs };
      }
    }

    const key = skuKey(planned.sku);
    const modelName = modelNameBySku.get(key);
    const manualPrice = manualPriceBySku.get(key);
    if (modelName) {
      nextPayload.nameOverride = true;
    }
    if (hiddenSkus.has(key)) nextPayload.hiddenFromShop = true;
    if (manualPrice) {
      nextPayload.commerceOverrides = {
        ...asRecord(nextPayload.commerceOverrides),
        price: true,
        ...(manualPrice.updatedAt ? { priceUpdatedAt: manualPrice.updatedAt } : {}),
      };
    }

    return {
      ...planned,
      ...(modelName ? { name_sr: modelName } : {}),
      ...(manualPrice
        ? {
            price_gross: manualPrice.priceGross,
            price_final_gross: manualPrice.priceFinalGross,
            rebate_percent: manualPrice.rebatePercent,
          }
        : {}),
      raw_payload: nextPayload,
    };
  });
};
