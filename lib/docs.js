import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportDevisToExcel = (devis) => {
  const data = [
    ["Numéro de Devis", devis.numero],
    ["Client", devis.client.nom],
    ["Semaine", devis.semaineRef],
    ["Date d'émission", new Date(devis.dateEmission).toLocaleDateString()],
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

export const exportFactureToPDF = (facture) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("FACTURE", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.text(`Numéro: ${facture.numero}`, 20, 40);
  doc.text(`Date d'émission: ${new Date(facture.dateEmission).toLocaleDateString()}`, 20, 45);
  doc.text(`Date d'échéance: ${new Date(facture.dateEcheance).toLocaleDateString()}`, 20, 50);
  
  // Client info
  doc.text("DESTINATAIRE:", 140, 40);
  doc.text(facture.client.nom, 140, 45);
  if (facture.client.email) doc.text(facture.client.email, 140, 50);
  if (facture.client.adresse) doc.text(facture.client.adresse, 140, 55);
  
  // Table
  const tableData = facture.devis.lignes.map(l => [
    l.description,
    l.quantite,
    l.unite,
    `${l.prixUnitaire} €`,
    `${l.montantHt} €`
  ]);
  
  doc.autoTable({
    startY: 70,
    head: [["Description", "Qté", "Unité", "P.U.", "Total HT"]],
    body: tableData,
  });
  
  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Total HT: ${facture.totalHt.toLocaleString()} €`, 140, finalY);
  doc.text(`TVA (20%): ${facture.totalTva.toLocaleString()} €`, 140, finalY + 5);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total TTC: ${facture.totalTtc.toLocaleString()} €`, 140, finalY + 12);
  
  doc.save(`${facture.numero}.pdf`);
};
