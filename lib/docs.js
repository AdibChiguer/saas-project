import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportDevisToExcel = (devis, currentUser = null) => {
  const data = [
    ["OFFRE / DEVIS"],
    ["Émetteur :", currentUser?.name || "Admin User"],
    ["Adresse :", currentUser?.adresse || ""],
    ["Téléphone :", currentUser?.telephone || ""],
    ["E-mail :", currentUser?.email || ""],
    [],
    ["DESTINATAIRE (ONTVANGER)"],
    ["Client :", devis.client.nom],
    ["Adresse :", devis.client.adresse || ""],
    ["Téléphone :", devis.client.telephone || ""],
    [],
    ["DÉTAILS DU DOCUMENT"],
    ["Numéro de Devis :", devis.numero],
    ["Semaine :", devis.semaineRef],
    ["Date d'émission :", new Date(devis.dateEmission).toLocaleDateString('fr-FR')],
    [],
    ["Description", "Quantité", "Unité", "Prix Unitaire", "Montant HT"]
  ];

  devis.lignes.forEach(ligne => {
    data.push([
      ligne.description,
      ligne.quantite,
      ligne.unite,
      ligne.prixUnitaire,
      ligne.montantHt
    ]);
  });

  data.push([]);
  data.push(["Total HT", "", "", "", devis.totalHt]);
  data.push(["TVA (20%)", "", "", "", devis.totalTva]);
  data.push(["Total TTC", "", "", "", devis.totalTtc]);

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Devis");
  
  XLSX.writeFile(wb, `${devis.numero}.xlsx`);
};

export const exportFactureToPDF = (facture, currentUser = null) => {
  const doc = new jsPDF();
  
  // ── HEADER (Current User / Company Info) ────────────────────────
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(currentUser?.name || "FACTURE", 20, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(currentUser?.adresse || "", 20, 28);
  doc.text(currentUser?.telephone || "", 20, 33);
  doc.text(currentUser?.email || "", 20, 38);
  if (currentUser?.kvknr) doc.text(`KVK: ${currentUser.kvknr}`, 20, 43);

  // ── DOCUMENT INFO ───────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DÉTAILS", 140, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Numéro: ${facture.numero}`, 140, 28);
  doc.text(`Date: ${new Date(facture.dateEmission).toLocaleDateString('fr-FR')}`, 140, 33);
  doc.text(`Échéance: ${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}`, 140, 38);
  
  // ── CLIENT INFO (Ontvanger) ─────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DESTINATAIRE (ONTVANGER):", 20, 60);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(facture.client.nom, 20, 68);
  if (facture.client.adresse) doc.text(facture.client.adresse, 20, 73);
  if (facture.client.telephone) doc.text(facture.client.telephone, 20, 78);
  if (facture.client.email) doc.text(facture.client.email, 20, 83);
  if (facture.client.kvknr) doc.text(`KVK: ${facture.client.kvknr}`, 20, 88);
  if (facture.client.btwnr) doc.text(`BTW: ${facture.client.btwnr}`, 20, 93);
  
  // ── TABLE ───────────────────────────────────────────────────────
  const tableData = facture.devis.lignes.map(l => [
    l.description,
    l.quantite,
    l.unite,
    `${l.prixUnitaire.toLocaleString()} €`,
    `${l.montantHt.toLocaleString()} €`
  ]);
  
  doc.autoTable({
    startY: 105,
    head: [["Description", "Qté", "Unité", "P.U.", "Total HT"]],
    body: tableData,
    headStyles: { fillStyle: 'fill', fillColor: [2, 6, 23] }, // Navy color
  });
  
  // ── TOTALS ──────────────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Total HT:`, 140, finalY);
  doc.text(`${facture.totalHt.toLocaleString()} €`, 180, finalY, { align: "right" });
  
  doc.text(`TVA (20%):`, 140, finalY + 5);
  doc.text(`${facture.totalTva.toLocaleString()} €`, 180, finalY + 5, { align: "right" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL TTC:`, 140, finalY + 12);
  doc.text(`${facture.totalTtc.toLocaleString()} €`, 180, finalY + 12, { align: "right" });
  
  doc.save(`${facture.numero}.pdf`);
};
