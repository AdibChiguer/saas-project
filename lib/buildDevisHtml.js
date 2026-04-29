// lib/devis/buildDevisHtml.js
//
// Props:
//   devis     — Prisma Devis with client (+ owner), lignes
//   workLogs  — WorkLog[] with client.owner included
//   param     — key/value map from Parametre table
//   user      — User row fetched directly (devis.client.owner)

// ── helpers ──────────────────────────────────────────────────────────────────
function esc(s) {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(n) {
  return Number(n).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString("fr-FR") : "";
}

// Monday=0 … Sunday=6
function dayIndex(date) {
  const d = new Date(date).getDay();
  return d === 0 ? 6 : d - 1;
}

// ── main builder ──────────────────────────────────────────────────────────────
export function buildDevisHtml({ devis, workLogs, param, user }) {
  // ── Logo / brand ─────────────────────────────────────────────────
  const logoName = param["company_logo_name"] || "EGW";
  const logoSub  = param["company_logo_sub"]  || "INSTALLTEC";

  // ── User (owner/company) — passed in directly from actions.js ────
  const ownerName  = user?.name       || "";
  const ownerSofi  = user?.Sofinummer || "";
  const ownerTel   = user?.telephone  || "";
  const ownerAddr  = user?.adresse    || "";
  const ownerKvk   = user?.kvknr      || "";
  const ownerEmail = user?.email      || "";

  // ── Client fields ─────────────────────────────────────────────────
  const clientKvk = devis.client?.kvknr || "";
  const clientBtw = devis.client?.btwnr || "";

  // ── Lines ─────────────────────────────────────────────────────────
  const linesHtml = devis.lignes
    .map(
      (l) => `
      <tr>
        <td>${esc(l.codes)}</td>
        <td>${esc(l.description)}</td>
        <td>${esc(l.unite)}</td>
        <td style="text-align:right">${fmt(l.prixUnitaire)}</td>
        <td style="text-align:right">${fmt(l.quantite)}</td>
        <td style="text-align:right">${fmt(l.montantHt)}</td>
      </tr>`
    )
    .join("");

  // ── Schedule grid — one row per user, days merged ────────────────
  //
  // Group workLogs by owner id. Each unique owner = one <tr>.
  // Within the group, fill day columns from startAt.
  // If two worklogs fall on the same day, sum their hours.

  const DAY_COLS = ["MA", "DI", "WO", "DO", "VR", "ZA", "ZO"];

  let scheduleRows;

  if (workLogs.length > 0) {
    // Map: ownerId → { name, sofi, hours[7] }
    const grouped = new Map();

    for (const wl of workLogs) {
      const wlOwner = wl.client?.owner ?? user;
      const id      = wlOwner?.id ?? "default";
      const name    = wlOwner?.name       || ownerName;
      const sofi    = wlOwner?.Sofinummer || ownerSofi;
      const di      = dayIndex(wl.startAt);

      if (!grouped.has(id)) {
        grouped.set(id, { name, sofi, hours: Array(7).fill(0) });
      }

      // Sum hours if multiple worklogs on the same day
      grouped.get(id).hours[di] += wl.heuresTotal;
    }

    scheduleRows = [...grouped.values()]
      .map(({ name, sofi, hours }) => {
        const cells = hours
          .map((h) => `<td>${h > 0 ? h + "h" : ""}</td>`)
          .join("");
        return `
        <tr>
          <td>${esc(name)}</td>
          <td>${esc(sofi)}</td>
          ${cells}
        </tr>`;
      })
      .join("");
  } else {
    // Fallback: 4 empty rows
    scheduleRows = Array(4)
      .fill(`
        <tr>
          <td>${esc(ownerName)}</td>
          <td>${esc(ownerSofi)}</td>
          ${DAY_COLS.map(() => "<td></td>").join("")}
        </tr>`)
      .join("");
  }

  // ── Address blocks ───────────────────────────────────────────────
  const clientAdresseHtml = devis.client?.adresse
    ? esc(devis.client.adresse).replace(/\n/g, "<br>")
    : "";

  const ownerAdresseHtml = ownerAddr
    ? esc(ownerAddr).replace(/\n/g, "<br>")
    : "";

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #222; background:#fff; }
  .page { width:210mm; min-height:297mm; padding:12mm 14mm 22mm 14mm; }

  /* ── Header ── */
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10mm; }
  .devis-title { font-size:32px; font-weight:900; color:#1a1a1a; }
  .logo-egw { font-size:28px; font-weight:900; color:#003087; letter-spacing:1px; text-align:right; line-height:1; }
  .logo-sub { font-size:11px; font-weight:700; color:#003087; letter-spacing:2px; text-align:right; }

  /* ── Owner / company block ── */
  .company-info { margin-bottom:8mm; }
  .company-info .owner-name    { font-size:12px; font-weight:700; margin-bottom:3px; }
  .company-info .owner-details { font-style:italic; font-size:10px; color:#444; line-height:1.8; }

  /* ── Meta box + receiver ── */
  .meta-receiver { display:flex; gap:8mm; margin-bottom:8mm; }
  .meta-box { background:#d6e4f7; padding:6px 10px; width:62mm; flex-shrink:0; font-size:10px; }
  .meta-box table { width:100%; border-collapse:collapse; }
  .meta-box td { padding:2px 0; }
  .meta-box td:first-child { white-space:nowrap; padding-right:6px; color:#555; }
  .receiver { flex:1; padding-left:4mm; }
  .receiver .label         { font-weight:700; font-size:11px; margin-bottom:2px; }
  .receiver .receiver-name { font-weight:700; font-size:11px; }
  .receiver p { font-style:italic; font-size:10px; color:#333; line-height:1.7; }

  /* ── Extra info ── */
  .extra-info { margin-bottom:6mm; }
  .extra-info .label { font-weight:700; font-size:11px; margin-bottom:2px; }

  /* ── Items table ── */
  .items-table { width:100%; border-collapse:collapse; margin-bottom:4mm; }
  .items-table thead tr { border-bottom:2px solid #1a1a1a; }
  .items-table th { font-weight:700; font-size:10.5px; padding:4px; text-align:left; }
  .items-table th:nth-child(n+4),
  .items-table td:nth-child(n+4) { text-align:right; }
  .items-table tbody tr { border-bottom:1px solid #ddd; }
  .items-table td { padding:4px; font-size:10px; }

  /* ── Totals ── */
  .totals { display:flex; justify-content:flex-end; margin-bottom:6mm; }
  .totals-box { width:70mm; font-size:10.5px; }
  .total-row { display:flex; justify-content:space-between; padding:2px 0; }
  .total-row.grand { font-weight:700; font-size:12px; color:#003087;
                     border-top:2px solid #003087; margin-top:4px; padding-top:5px; }

  /* ── Signature ── */
  .signature { text-align:center; font-style:italic; font-size:9.5px; color:#555;
               border-top:1px solid #ccc; padding-top:4px; margin-bottom:8mm; }

  /* ── Schedule grid ── */
  .schedule-table { width:100%; border-collapse:collapse; font-size:10px; }
  .schedule-table th,
  .schedule-table td { border:1px solid #999; padding:5px 4px; }
  .schedule-table th { font-weight:700; background:#f5f5f5; }
  .schedule-table td { height:20px; }

  /* ── Footer bar ── */
  .footer-bar { position:fixed; bottom:0; left:0; width:100%; height:6px; background:#003087; }
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="devis-title">DEVIS n° ${esc(devis.numero)}</div>
    <div>
      <div class="logo-egw">${esc(logoName)}</div>
      <div class="logo-sub">${esc(logoSub)}</div>
    </div>
  </div>

  <!-- META BOX + RECEIVER -->
  <div class="meta-receiver">
    <div class="meta-box">
      <table>
        <tr><td>Datum offerte</td>  <td>${fmtDate(devis.dateEmission)}</td></tr>
        <tr><td>Référence</td>      <td>${esc(devis.numero)}</td></tr>
        <tr><td>Contactpersoon</td> <td>${esc(ownerName)}</td></tr>
        <tr><td>Téléphone</td>      <td>${esc(ownerTel)}</td></tr>
        <tr><td>E-mail</td>      <td>${esc(ownerEmail)}</td></tr>
        ${ownerKvk ? `<tr><td>KVK nr.</td><td>${esc(ownerKvk)}</td></tr>` : ""}
      </table>
    </div>
    <div class="receiver">
      <div class="label">ONTVANGER</div>
      <div class="receiver-name">${esc(devis.client?.nom ?? "")}</div>
      <p>
        ${clientAdresseHtml}
        ${devis.client?.telephone ? `<br>${esc(devis.client.telephone)}` : ""}
        ${devis.client?.email     ? `<br>${esc(devis.client.email)}`     : ""}
        ${clientKvk               ? `<br>KVK&nbsp;: ${esc(clientKvk)}`  : ""}
        ${clientBtw               ? `<br>BTW&nbsp;: ${esc(clientBtw)}`  : ""}
      </p>
    </div>
  </div>

  <!-- ADDITIONAL INFO -->
  <div class="extra-info">
    <div class="label">Aanvullende informatie</div>
    <p>${esc(devis.notes ?? "")}</p>
  </div>

  <!-- ITEMS TABLE -->
  <table class="items-table">
    <thead>
      <tr>
        <th>Codes</th>
        <th>Omschrijving</th>
        <th>Eenheid</th>
        <th>Stukprijs</th>
        <th>Aant</th>
        <th>Totaal HT</th>
      </tr>
    </thead>
    <tbody>${linesHtml}</tbody>
  </table>

  <!-- TOTAL -->
  <div class="totals">
    <div class="totals-box">
      <div class="total-row grand">
        <span>Totaal</span>
        <span>${fmt(devis.total)} €</span>
      </div>
    </div>
  </div>

  <!-- SIGNATURE -->
  <div class="signature">
    Handtekening van de klant (met vermelding van "Goedgekeurd")
  </div>

  <!-- SCHEDULE GRID -->
  <table class="schedule-table">
    <thead>
      <tr>
        <th>Naam</th>
        <th>Sofinummer</th>
        <th>MA</th><th>DI</th><th>WO</th><th>DO</th><th>VR</th><th>ZA</th><th>ZO</th>
      </tr>
    </thead>
    <tbody>${scheduleRows}</tbody>
  </table>

</div>
<div class="footer-bar"></div>
</body>
</html>`;
}