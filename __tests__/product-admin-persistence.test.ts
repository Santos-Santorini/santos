import { describe, expect, it } from "vitest";
import {
  classifyCatalogRemovalRows,
  mergeFreshAdminStateIntoMofficeRows,
} from "@/lib/catalog/adminPersistence";

describe("catalog admin persistence across mOffice sync", () => {
  it("keeps the latest admin name and hide flag while accepting fresh mOffice data", () => {
    const planned = [{
      legacy_id: 10,
      sku: "129672",
      name_sr: "C8/161",
      stock_total: 1,
      raw_payload: {
        source: "moffice",
        attributes: { size: ["S"] },
        moffice: { syncedRunId: "new-run", stock: 1 },
      },
    }];
    const current = [{
      legacy_id: 10,
      sku: "129672",
      name_sr: "Ruben zuta kosulja",
      raw_payload: {
        source: "moffice",
        nameOverride: true,
        hiddenFromShop: true,
        categories: [{ id: 7, name: "Kosulje", path: ["Kosulje"] }],
        attributes: { size: ["S"], material: ["Pamuk"] },
        moffice: { syncedRunId: "old-run", stock: 2 },
      },
    }];

    const [merged] = mergeFreshAdminStateIntoMofficeRows(planned, current);

    expect(merged.name_sr).toBe("Ruben zuta kosulja");
    expect(merged.stock_total).toBe(1);
    expect(merged.raw_payload).toMatchObject({
      nameOverride: true,
      hiddenFromShop: true,
      categories: [{ id: 7, name: "Kosulje", path: ["Kosulje"] }],
      attributes: { size: ["S"], material: ["Pamuk"] },
      moffice: { syncedRunId: "new-run", stock: 1 },
    });
  });

  it("copies a model-level admin name and hide flag to a newly imported size", () => {
    const planned = [{
      legacy_id: 11,
      sku: "129672",
      name_sr: "C8/161",
      raw_payload: {
        source: "moffice",
        attributes: { size: ["4XL"] },
        moffice: { syncedRunId: "new-run" },
      },
    }];
    const current = [{
      legacy_id: 10,
      sku: "129672",
      name_sr: "Ruben zuta kosulja",
      raw_payload: { source: "moffice", nameOverride: true, hiddenFromShop: true },
    }];

    const [merged] = mergeFreshAdminStateIntoMofficeRows(planned, current);

    expect(merged.name_sr).toBe("Ruben zuta kosulja");
    expect(merged.raw_payload).toMatchObject({ nameOverride: true, hiddenFromShop: true });
  });

  it("keeps a SKU-wide online price saved while an mOffice sync is already running", () => {
    const planned = [
      {
        legacy_id: 10,
        sku: "129672",
        stock_total: 5,
        price_gross: 15900,
        price_final_gross: 15900,
        rebate_percent: 0,
        raw_payload: { source: "moffice", attributes: { size: ["S"] }, moffice: { stock: 5 } },
      },
      {
        legacy_id: 11,
        sku: "129672",
        stock_total: 7,
        price_gross: 15900,
        price_final_gross: 15900,
        rebate_percent: 0,
        raw_payload: { source: "moffice", attributes: { size: ["M"] }, moffice: { stock: 7 } },
      },
    ];
    const current = [
      {
        legacy_id: 10,
        sku: "129672",
        price_gross: 15000,
        price_final_gross: 12000,
        rebate_percent: 20,
        raw_payload: {
          source: "moffice",
          commerceOverrides: { price: true, priceUpdatedAt: "2026-09-08T08:00:00.000Z" },
        },
      },
      {
        legacy_id: 11,
        sku: "129672",
        price_gross: 15900,
        price_final_gross: 15900,
        rebate_percent: 0,
        raw_payload: { source: "moffice" },
      },
    ];

    const merged = mergeFreshAdminStateIntoMofficeRows(planned, current);

    expect(merged.map((row) => ({
      stock: row.stock_total,
      gross: row.price_gross,
      final: row.price_final_gross,
      rebate: row.rebate_percent,
      override: (row.raw_payload as Record<string, any>).commerceOverrides?.price,
    }))).toEqual([
      { stock: 5, gross: 15000, final: 12000, rebate: 20, override: true },
      { stock: 7, gross: 15000, final: 12000, rebate: 20, override: true },
    ]);
  });

  it("treats mOffice rows as hide-only and manual rows as hard deletions", () => {
    const result = classifyCatalogRemovalRows([
      { legacy_id: 1, sku: "129672", raw_payload: { source: "moffice", moffice: { id: 75670 } } },
      { legacy_id: 2, sku: "MANUAL-1", raw_payload: { source: "admin" } },
      { legacy_id: 3, sku: "131743", raw_payload: { legacyRaw: {} } },
    ]);

    expect(result.mofficeSkus).toEqual(["129672", "131743"]);
    expect(result.manualLegacyIds).toEqual([2]);
  });
});
