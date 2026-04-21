// lib/generateReport.js
import * as XLSX from "xlsx";

export function generateReportXLSX(data) {
  const wb = XLSX.utils.book_new();
  const ws = {};

  const {
    company, year, weekNumber, contactPerson, lines = [], workers = []
  } = data;

  // ── helpers ───────────────────────────────────────────────────────────────
  function setCell(ws, addr, value, opts = {}) {
    ws[addr] = { v: value, t: typeof value === "number" ? "n" : "s", ...opts };
  }

  // ── HEADER ────────────────────────────────────────────────────────────────
  setCell(ws, "B2", company.name);

  setCell(ws, "E5", "Year:");          setCell(ws, "F5", String(year));
  setCell(ws, "E6", "Week:");          setCell(ws, "F6", String(weekNumber));
  setCell(ws, "E7", "Contact person:"); setCell(ws, "F7", contactPerson);

  setCell(ws, "I2", company.name);
  setCell(ws, "I3", company.address);
  setCell(ws, "I4", company.city);
  setCell(ws, "I5", company.phone);
  setCell(ws, "I6", company.email);
  setCell(ws, "I7", company.chamberOfCommerce);

  // ── TABLE HEADER (row 9) ──────────────────────────────────────────────────
  setCell(ws, "B9", "Codes");
  setCell(ws, "C9", "Description");
  setCell(ws, "H9", "Unit");
  setCell(ws, "I9", "Unit Price");
  setCell(ws, "J9", "Quantity");
  setCell(ws, "K9", "Total");

  // ── LINE ITEMS (start row 11) ─────────────────────────────────────────────
  const startRow = 11;
  let grandTotal = 0;

  lines.forEach((line, i) => {
    const r = startRow + i;
    const amount = (line.unitPrice || 0) * (line.quantity || 0);
    grandTotal += amount;

    setCell(ws, `B${r}`, line.code        || "");
    setCell(ws, `C${r}`, line.description || "");
    setCell(ws, `H${r}`, line.unit        || "pcs");
    setCell(ws, `I${r}`, line.unitPrice   || 0, { t: "n", z: '€ #,##0.00' });
    setCell(ws, `J${r}`, line.quantity    || 0, { t: "n" });
    setCell(ws, `K${r}`, amount,               { t: "n", z: '€ #,##0.00' });
  });

  // ── TOTAL ROW ─────────────────────────────────────────────────────────────
  const totalRow = startRow + lines.length + 1;
  setCell(ws, `J${totalRow}`, "Total:");
  setCell(ws, `K${totalRow}`, grandTotal, { t: "n", z: '€ #,##0.00' });

  // ── WORKERS REGISTER ──────────────────────────────────────────────────────
  const workersRow = totalRow + 2;

  setCell(ws, `B${workersRow}`, "Workers register:");
  setCell(ws, `D${workersRow}`, "Week:");

  const workersHeaderRow = workersRow + 1;
  const workerHeaders = ["Name", "SSN",  "MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const workerCols    = ["B",    "C",    "D",   "E",   "F",   "G",   "H",   "I",   "J"];

  workerHeaders.forEach((hdr, i) => {
    setCell(ws, `${workerCols[i]}${workersHeaderRow}`, hdr);
  });

  workers.forEach((worker, i) => {
    const row = workersHeaderRow + 1 + i;
    const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const rowValues = [
      worker.name || "",
      worker.ssn  || "",
      ...dayKeys.map(d => worker[d] || ""),
    ];
    rowValues.forEach((val, j) => {
      setCell(ws, `${workerCols[j]}${row}`, val);
    });
  });

  // ── MERGES ────────────────────────────────────────────────────────────────
  ws["!merges"] = [
    { s: { r: 1, c: 1 }, e: { r: 6, c: 3 } },  // B2:D7  logo/company
    { s: { r: 8, c: 2 }, e: { r: 8, c: 6 } },  // C9:G9  description header
    ...lines.map((_, i) => ({                    // C11:G1x description cells
      s: { r: startRow - 1 + i, c: 2 },
      e: { r: startRow - 1 + i, c: 6 },
    })),
    { s: { r: totalRow - 1, c: 1 }, e: { r: totalRow - 1, c: 9 } }, // total label
    { s: { r: 1,  c: 8 }, e: { r: 1,  c: 10 } }, // I2:K2
    { s: { r: 2,  c: 8 }, e: { r: 2,  c: 10 } }, // I3:K3
    { s: { r: 3,  c: 8 }, e: { r: 3,  c: 10 } }, // I4:K4
    { s: { r: 4,  c: 8 }, e: { r: 4,  c: 10 } }, // I5:K5
    { s: { r: 5,  c: 8 }, e: { r: 5,  c: 10 } }, // I6:K6
    { s: { r: 6,  c: 8 }, e: { r: 6,  c: 10 } }, // I7:K7
    { s: { r: workersRow - 1, c: 1 }, e: { r: workersRow - 1, c: 2 } },
  ];

  // ── COLUMN WIDTHS ─────────────────────────────────────────────────────────
  ws["!cols"] = [
    { wch: 3  }, // A
    { wch: 14 }, // B
    { wch: 18 }, // C
    { wch: 8  }, // D
    { wch: 8  }, // E
    { wch: 8  }, // F
    { wch: 8  }, // G
    { wch: 8  }, // H
    { wch: 12 }, // I
    { wch: 9  }, // J
    { wch: 13 }, // K
  ];

  // ── SHEET RANGE ───────────────────────────────────────────────────────────
  const lastRow = workersHeaderRow + workers.length + 5;
  ws["!ref"] = `A1:K${lastRow}`;

  XLSX.utils.book_append_sheet(wb, ws, "Report");
  return wb;
}