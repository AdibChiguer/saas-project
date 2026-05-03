// lib/facture/buildFactureHtml.js
//
// The logged-in user's info comes from facture.client.owner (User model).
// This works because Client.ownerId → User, so the client always belongs
// to the user who created it = the logged-in user.
//
// Required Prisma include in your query:
//   include: {
//     client: {
//       include: { owner: true }   ← gives us User fields
//     },
//     devis: {
//       include: {
//         lignes: { include: { workLog: true } }
//       }
//     }
//   }

// ── helpers ───────────────────────────────────────────────────────────────────
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

// JS getDay() → Dutch day abbreviation
const JS_DAY_TO_NL = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
const DAY_ORDER    = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

// ── main builder ──────────────────────────────────────────────────────────────
export function buildFactureHtml({ facture, param }) {
  const client = facture.client ?? {};
  const devis  = facture.devis  ?? {};
  const lignes = devis.lignes   ?? [];

  // ── Logged-in user = client.owner ─────────────────────────────────
  // This is never hardcoded — it always reflects whoever owns the client
  // (i.e. the authenticated user who created the client record).
  const user        = client.owner ?? {};
  const userName    = user.name        || "";
  const userAddr    = user.adresse     || "";
  const userTel     = user.telephone   || "";
  const userEmail   = user.email       || "";
  const userSofi    = user.Sofinummer  || "";
  const userKvk     = user.kvknr       || "";

  // ── Optional overrides from Parametre table ────────────────────────
  // These let admins set IBAN, BTW number, etc. without touching code.
  // If not set in Parametre, fields are left blank.
  const iban        = user.Iban || "";
  const btwNr       = param["btw_number"]        || "";
  const paymentDays = param["payment_days"]      || "35";
  const logoText    = param["company_logo_text"] || userName;

  // ── Week label from devis.semaineRef ──────────────────────────────
  // "2025-W03" → "Week 3"
  const weekLabel = devis.semaineRef
    ? devis.semaineRef.replace(/^\d{4}-W0?/, "Week ")
    : "";

  // ── Group DevisLignes by day of week ──────────────────────────────
  // Each ligne links to a WorkLog which has a startAt date.
  // We use that date to put the ligne in the right day column.
  const dayBuckets = {};
  DAY_ORDER.forEach((d) => { dayBuckets[d] = []; });

  lignes.forEach((l) => {
    const wl  = l.workLog;
    const day = wl ? JS_DAY_TO_NL[new Date(wl.startAt).getDay()] : null;
    if (day && dayBuckets[day]) {
      dayBuckets[day].push(l);
    } else {
      // No worklog date → put in first empty bucket
      const slot = DAY_ORDER.find((d) => dayBuckets[d].length === 0);
      if (slot) dayBuckets[slot].push(l);
    }
  });

  // ── Build table rows ───────────────────────────────────────────────
  const rowsHtml = DAY_ORDER.map((day) => {
    const entries = dayBuckets[day];
    if (entries.length === 0) {
      return `
      <tr>
        <td class="day-cell">${day}</td>
        <td class="desc-cell"></td>
        <td class="num-cell"></td>
        <td class="num-cell">€</td>
      </tr>`;
    }
    return entries.map((l, i) => `
      <tr>
        <td class="day-cell">${i === 0 ? day : ""}</td>
        <td class="desc-cell">${esc(l.description)}</td>
        <td class="num-cell">${fmt(l.quantite)}</td>
        <td class="num-cell">€&nbsp;${fmt(l.montantHt)}</td>
      </tr>`).join("");
  }).join("");

  // ── Build user address lines ───────────────────────────────────────
  const userAddrLines = userAddr
    ? esc(userAddr).replace(/\n/g, "<br>")
    : "";

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
    color: #1a1a2e;
    background: #fff;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  /* ── Top banner ── */
  .top-banner {
    background: linear-gradient(135deg, #c8d8ec 0%, #e4edf5 50%, #b0c4d8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 30px 16px;
    min-height: 75px;
  }
  .logo-text {
    font-size: 24px;
    font-weight: 900;
    font-style: italic;
    color: #003087;
    letter-spacing: -0.5px;
  }

  /* ── Facture label ── */
  .facture-label-wrap { padding: 0 0 0 30px; margin-top: -1px; }
  .facture-label {
    display: inline-block;
    background: #003087;
    color: #fff;
    font-weight: 900;
    font-size: 13px;
    padding: 6px 20px;
  }

  /* ── Week heading ── */
  .week-heading {
    font-size: 24px;
    font-weight: 900;
    padding: 10px 30px 0;
    color: #1a1a2e;
  }

  /* ── Sender + meta row ── */
  .sender-meta {
    display: flex;
    padding: 10px 30px;
    gap: 20px;
    border-bottom: 1px solid #b8cce0;
    margin-bottom: 6px;
  }
  .sender-block {
    flex: 1;
    font-size: 9px;
    line-height: 1.9;
    color: #333;
  }
  .meta-block {
    min-width: 150px;
    font-size: 9px;
    line-height: 2;
  }
  .meta-block .meta-key {
    font-weight: 900;
    color: #003087;
    margin-right: 4px;
  }

  /* ── AAN (client) section ── */
  .aan-section {
    padding: 4px 30px 10px;
    border-bottom: 2px solid #003087;
    margin-bottom: 4px;
  }
  .aan-label {
    font-size: 8.5px;
    font-weight: 900;
    color: #003087;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 3px;
  }
  .aan-section .client-name { font-weight: 700; font-size: 10px; }
  .aan-section p { font-size: 9px; line-height: 1.8; color: #333; }

  /* ── Instructies label ── */
  .instructies-label {
    font-size: 8.5px;
    font-weight: 900;
    color: #003087;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 4px 30px 3px;
  }

  /* ── Work table ── */
  .work-table {
    width: calc(100% - 60px);
    margin: 0 30px 0;
    border-collapse: collapse;
    font-size: 9.5px;
  }
  .work-table thead tr { background: #003087; color: #fff; }
  .work-table th {
    padding: 5px 7px;
    font-size: 8.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: left;
  }
  .work-table th.num-cell,
  .work-table td.num-cell { text-align: right; }
  .work-table tbody tr { border-bottom: 1px solid #dde8f0; }
  .work-table tbody tr:nth-child(even) { background: #f4f8fc; }
  .work-table td { padding: 5px 7px; vertical-align: top; }
  .work-table td.day-cell {
    font-weight: 700;
    color: #003087;
    width: 28px;
    white-space: nowrap;
  }
  .work-table td.desc-cell { color: #333; }

  /* ── Totals ── */
  .totals-section {
    margin: 0 30px;
    border-top: 2px solid #003087;
    padding-top: 2px;
  }
  .total-row {
    display: flex;
    justify-content: flex-end;
    padding: 3px 0;
    border-bottom: 1px solid #e4edf5;
    font-size: 9.5px;
  }
  .total-row .tl {
    width: 110px;
    font-weight: 700;
    text-align: right;
    padding-right: 16px;
    color: #1a1a2e;
  }
  .total-row .tv {
    width: 90px;
    text-align: right;
  }
  .total-row.grand {
    font-weight: 900;
    font-size: 11px;
    border-bottom: none;
    padding-top: 5px;
  }
  .total-row.grand .tl { color: #003087; }

  /* ── Payment note ── */
  .payment-note {
    margin: 8px 30px 0;
    padding-top: 6px;
    border-top: 1px solid #dde8f0;
    font-size: 8.5px;
    line-height: 1.7;
    color: #444;
  }

  /* ── Footer ── */
  .spacer { flex: 1; }
  .footer { width: 100%; margin-top: 16px; }
  .footer-icons {
    display: flex;
    justify-content: space-around;
    padding: 10px 30px 6px;
    border-top: 1px solid #c8d8e8;
  }
  .footer-icon-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    font-size: 8px;
    color: #555;
  }
  .footer-icon { font-size: 15px; line-height: 1; }
  .footer-bar {
    display: flex;
    justify-content: space-between;
    background: #e4edf5;
    padding: 5px 30px;
    font-size: 7.5px;
    color: #555;
  }

  @media print {
    body { background: #fff; }
    .page { width: 210mm; min-height: 297mm; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- TOP BANNER with logo -->
  <div class="top-banner">
    <div class="logo-text">EGW-InstallTec</div>
  </div>

  <!-- FACTURE LABEL -->
  <div class="facture-label-wrap">
    <span class="facture-label">Factuur</span>
  </div>

  <!-- WEEK HEADING -->
  <div class="week-heading">${esc(weekLabel)}:</div>

  <!-- SENDER INFO + FACTURE META -->
  <div class="sender-meta">
    <div class="sender-block">
      ${userAddrLines}
      ${userTel   ? `<br>${esc(userTel)}`                     : ""}
      ${btwNr     ? `<br>Btw.nr: ${esc(btwNr)}`              : ""}
      ${userEmail ? `<br>${esc(userEmail)}`                   : ""}
      ${iban      ? `<br>IBAN: ${esc(iban)}`                  : ""}
    </div>
    <div class="meta-block">
      <div><span class="meta-key">FACTUURNR.:</span>${esc(facture.numero)}</div>
      <div><span class="meta-key">DATUM:</span>${fmtDate(facture.dateEmission)}</div>
      ${facture.dateEcheance
        ? `<div><span class="meta-key">VERVALDATUM:</span>${fmtDate(facture.dateEcheance)}</div>`
        : ""}
    </div>
  </div>

  <!-- CLIENT (AAN) BLOCK -->
  <div class="aan-section">
    <div class="aan-label">Aan:</div>
    <div class="client-name">${esc(client.nom)}</div>
    <p>
      ${client.adresse   ? esc(client.adresse).replace(/\n/g, "<br>") + "<br>" : ""}
      ${client.telephone ? `Tel: ${esc(client.telephone)}<br>`                  : ""}
      ${client.email     ? `E-mail: ${esc(client.email)}<br>`                   : ""}
      ${client.kvknr     ? `KVKnr: ${esc(client.kvknr)}<br>`                    : ""}
      ${client.btwnr     ? `BTWnr: ${esc(client.btwnr)}`                        : ""}
    </p>
  </div>

  <!-- INSTRUCTIES -->
  <div class="instructies-label">Instructies:</div>

  <!-- WORK TABLE -->
  <table class="work-table">
    <thead>
      <tr>
        <th>Week:</th>
        <th>Werkzaamheden:</th>
        <th class="num-cell">Aantal:</th>
        <th class="num-cell">Prijs:</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <!-- TOTALS -->
  <div class="totals-section">
    <div class="total-row">
      <div class="tl">SUBTOTAAL</div>
      <div class="tv">€&nbsp;${fmt(facture.totalHt)}</div>
    </div>
    <div class="total-row">
      <div class="tl">BTW</div>
      <div class="tv">€&nbsp;0,-</div>
    </div>
    <div class="total-row">
      <div class="tl">BTW VERLEGD</div>
      <div class="tv">&nbsp;</div>
    </div>
    <div class="total-row grand">
      <div class="tl">TOTAAL</div>
      <div class="tv">€&nbsp;${fmt(facture.totalTtc)}</div>
    </div>
  </div>

  <!-- PAYMENT NOTE -->
  <div class="payment-note">
    Graag verzoek ik u vriendelijk bovenstaand bedrag binnen
    <strong>${esc(paymentDays)} dagen</strong>
    te voldoen op bankrekening
    ${iban ? `<strong>${esc(iban)}</strong>` : "___________"}
    t.n.v. <strong>${esc(userName)}</strong>
    onder vermelding van het <strong>factuurnummer.</strong>
  </div>

  <div class="spacer"></div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-icons">
      <div class="footer-icon-col">
        <span class="footer-icon">📍</span>
        <span>${esc(userAddr).replace(/\n/g, " ")}</span>
      </div>
      <div class="footer-icon-col">
        <span class="footer-icon">📞</span>
        <span>${esc(userTel)}</span>
      </div>
      <div class="footer-icon-col">
        <span class="footer-icon">✉️</span>
        <span>${esc(userEmail)}</span>
      </div>
    </div>
  </div>

</div>
</body>
</html>`;
}