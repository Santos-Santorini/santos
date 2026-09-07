type JsonRecord = Record<string, unknown>;

export type CatalogPersistenceRow = {
  legacy_id: number;
  sku: string | null;
  name_sr?: string | null;
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

  for (const row of currentRows) {
    const key = skuKey(row.sku);
    if (!key) continue;
    const payload = asRecord(row.raw_payload);
    const name = String(row.name_sr || "").trim();
    if (payload.nameOverride === true && name && !modelNameBySku.has(key)) modelNameBySku.set(key, name);
    if (payload.hiddenFromShop === true) hiddenSkus.add(key);
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
    if (modelName) {
      nextPayload.nameOverride = true;
    }
    if (hiddenSkus.has(key)) nextPayload.hiddenFromShop = true;

    return {
      ...planned,
      ...(modelName ? { name_sr: modelName } : {}),
      raw_payload: nextPayload,
    };
  });
};
