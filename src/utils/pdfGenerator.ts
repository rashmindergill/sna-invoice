
import jsPDF from 'jspdf';

interface Invoice {
  id: string;
  invoiceNumber: string;
  loadNumber: string;
  broker: string;
  driver: string;
  truckNumber: string;
  rate: number;
  pickupLocation: string;
  deliveryLocation: string;
  pickupDate: string;
  deliveryDate: string;
  notes: string;
  status: 'unpaid' | 'paid' | 'partial';
  paymentMethod?: string;
  paymentDate?: string;
  paidAmount?: number;
  createdAt: string;
  additionalCosts?: Array<{name: string; amount: number}>;
  includePickupInfo?: boolean;
}

export const generateInvoicePDF = async (invoice: Invoice) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 30;
  let yPos = 40;
  
  // Company Header
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Haul-It Pro', margin, yPos);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Phone: (555) 123-4567', margin, yPos + 15);
  pdf.text('PO Box 915654', margin, yPos + 25);
  pdf.text('Kansas City, MO 64111', margin, yPos + 35);
  
  // Invoice Title - Large and Bold
  yPos += 60;
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'normal');
  pdf.text('INVOICE', margin, yPos);
  
  // Invoice Details - Right aligned
  pdf.setFontSize(11);
  pdf.text(`Invoice Number: ${invoice.invoiceNumber}`, pageWidth - margin, yPos - 30, { align: 'right' });
  pdf.text(`Terms: Net 30 Days`, pageWidth - margin, yPos - 20, { align: 'right' });
  pdf.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, pageWidth - margin, yPos - 10, { align: 'right' });
  pdf.text(`Due Date: ${new Date(new Date(invoice.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`, pageWidth - margin, yPos, { align: 'right' });
  
  // Bill To Section
  yPos += 40;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bill To:', margin, yPos);
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoice.broker, margin, yPos + 12);
  
  // From/To Section (only if pickup info is included)
  if (invoice.includePickupInfo) {
    yPos += 40;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`From: ${invoice.pickupLocation}`, margin, yPos);
    pdf.text(`Trip #: ${invoice.loadNumber}`, margin + 200, yPos);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`To: ${invoice.deliveryLocation}`, margin, yPos + 12);
    pdf.text(`Truck #: ${invoice.truckNumber}`, margin + 200, yPos + 12);
    pdf.text(`Driver: ${invoice.driver}`, margin + 200, yPos + 24);
  }
  
  // Activity Table Header
  yPos += invoice.includePickupInfo ? 60 : 40;
  pdf.setFillColor(0, 0, 0);
  pdf.rect(margin, yPos - 8, pageWidth - 2 * margin, 20, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Activity', margin + 5, yPos + 2);
  pdf.text('Rate', pageWidth - margin - 80, yPos + 2);
  pdf.text('Amount', pageWidth - margin - 5, yPos + 2, { align: 'right' });
  
  // Main Service Line
  yPos += 25;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  const serviceDate = invoice.deliveryDate ? new Date(invoice.deliveryDate).toLocaleDateString() : new Date(invoice.createdAt).toLocaleDateString();
  pdf.text(`1 Load Shipped on ${serviceDate}`, margin + 5, yPos);
  pdf.text(`$${invoice.rate.toFixed(2)}`, pageWidth - margin - 80, yPos);
  pdf.text(`$${invoice.rate.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });
  
  // Additional Costs
  if (invoice.additionalCosts && invoice.additionalCosts.length > 0) {
    invoice.additionalCosts.forEach((cost) => {
      yPos += 15;
      pdf.text(cost.name, margin + 5, yPos);
      pdf.text(`$${cost.amount.toFixed(2)}`, pageWidth - margin - 80, yPos);
      pdf.text(`$${cost.amount.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });
    });
  }
  
  // Dotted line
  yPos += 20;
  pdf.setLineWidth(0.5);
  pdf.setLineDashPattern([2, 2], 0);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  pdf.setLineDashPattern([], 0);
  
  // Totals
  const totalAmount = invoice.rate + (invoice.additionalCosts?.reduce((sum, cost) => sum + cost.amount, 0) || 0);
  
  yPos += 20;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Make checks payable to:', margin, yPos);
  pdf.text(`Subtotal: $${totalAmount.toFixed(2)}`, pageWidth - margin - 5, yPos - 15, { align: 'right' });
  
  pdf.setFont('helvetica', 'normal');
  pdf.text('Haul-It Pro Inc', margin, yPos + 12);
  pdf.text('PO Box 915654', margin, yPos + 24);
  pdf.text('Kansas City, MO 64111', margin, yPos + 36);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Total: $${totalAmount.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });
  
  // Large Balance Due
  yPos += 15;
  pdf.setFontSize(16);
  pdf.text(`Balance Due: $${totalAmount.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });
  
  // Thank you message
  const footerY = pdf.internal.pageSize.height - 40;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  
  // Save the PDF
  pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
};
