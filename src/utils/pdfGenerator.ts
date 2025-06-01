
import jsPDF from 'jspdf';

interface AdditionalCost {
  description: string;
  amount: number;
}

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
  additionalCosts?: AdditionalCost[];
  includeRouteInfo?: boolean;
}

export const generateInvoicePDF = async (invoice: Invoice) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 25;
  
  // Clean Apple-inspired layout
  let yPos = 25;
  
  // Company Header - minimal and clean
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('HAUL-IT PRO', margin, yPos);
  
  yPos += 8;
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Professional Trucking Services', margin, yPos);
  
  // Invoice details on the right
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', pageWidth - margin, 25, { align: 'right' });
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`#${invoice.invoiceNumber}`, pageWidth - margin, 33, { align: 'right' });
  pdf.text(new Date(invoice.createdAt).toLocaleDateString(), pageWidth - margin, 41, { align: 'right' });
  
  yPos = 65;
  
  // Bill To section
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('BILL TO', margin, yPos);
  
  yPos += 8;
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.text(invoice.broker, margin, yPos);
  
  yPos += 20;
  
  // Table header with minimal lines
  const tableStartY = yPos;
  const colWidths = [40, 40, 40, 35, 35];
  const headers = ['DESCRIPTION', 'LOAD #', 'DRIVER', 'TRUCK', 'AMOUNT'];
  
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'bold');
  
  let xPos = margin;
  headers.forEach((header, index) => {
    pdf.text(header, xPos, yPos);
    xPos += colWidths[index];
  });
  
  // Thin line under headers
  yPos += 3;
  pdf.setLineWidth(0.3);
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 12;
  
  // Main service row
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  
  xPos = margin;
  const rowData = [
    'Freight Transportation',
    invoice.loadNumber,
    invoice.driver,
    invoice.truckNumber,
    `$${invoice.rate.toFixed(2)}`
  ];
  
  rowData.forEach((data, index) => {
    if (index === headers.length - 1) {
      pdf.text(data, xPos + colWidths[index], yPos, { align: 'right' });
    } else {
      pdf.text(data, xPos, yPos);
    }
    xPos += colWidths[index];
  });
  
  yPos += 15;
  
  // Route information (only if toggle is enabled)
  if (invoice.includeRouteInfo && (invoice.pickupLocation || invoice.deliveryLocation)) {
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('ROUTE DETAILS', margin, yPos);
    
    yPos += 8;
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    
    if (invoice.pickupLocation) {
      pdf.text(`From: ${invoice.pickupLocation}`, margin, yPos);
      yPos += 6;
    }
    
    if (invoice.deliveryLocation) {
      pdf.text(`To: ${invoice.deliveryLocation}`, margin, yPos);
      yPos += 6;
    }
    
    if (invoice.pickupDate) {
      pdf.text(`Pickup: ${new Date(invoice.pickupDate).toLocaleDateString()}`, margin, yPos);
      yPos += 6;
    }
    
    if (invoice.deliveryDate) {
      pdf.text(`Delivery: ${new Date(invoice.deliveryDate).toLocaleDateString()}`, margin, yPos);
      yPos += 6;
    }
    
    yPos += 10;
  }
  
  // Additional costs
  let subtotal = invoice.rate;
  if (invoice.additionalCosts && invoice.additionalCosts.length > 0) {
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('ADDITIONAL CHARGES', margin, yPos);
    
    yPos += 8;
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    
    invoice.additionalCosts.forEach(cost => {
      if (cost.description && cost.amount > 0) {
        pdf.text(cost.description, margin, yPos);
        pdf.text(`$${cost.amount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
        subtotal += cost.amount;
        yPos += 6;
      }
    });
    
    yPos += 10;
  }
  
  // Total section - clean and minimal
  const totalSectionY = yPos;
  pdf.setLineWidth(0.3);
  pdf.setDrawColor(0, 0, 0);
  pdf.line(pageWidth - 80, totalSectionY, pageWidth - margin, totalSectionY);
  
  yPos += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('TOTAL', pageWidth - 60, yPos);
  pdf.text(`$${subtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  
  // Payment status (if not unpaid)
  if (invoice.status !== 'unpaid') {
    yPos += 20;
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('PAYMENT STATUS', margin, yPos);
    
    yPos += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text(invoice.status === 'paid' ? 'PAID' : 'PARTIAL PAYMENT', margin, yPos);
    
    if (invoice.paymentMethod) {
      yPos += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Method: ${invoice.paymentMethod}`, margin, yPos);
    }
    
    if (invoice.paymentDate) {
      yPos += 6;
      pdf.text(`Date: ${new Date(invoice.paymentDate).toLocaleDateString()}`, margin, yPos);
    }
  }
  
  // Notes (if any)
  if (invoice.notes) {
    yPos += 20;
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('NOTES', margin, yPos);
    
    yPos += 8;
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    const noteLines = pdf.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
    pdf.text(noteLines, margin, yPos);
  }
  
  // Footer - minimal
  const footerY = pageHeight - 25;
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Payment Terms: Net 30 Days', pageWidth / 2, footerY, { align: 'center' });
  
  // Save the PDF
  pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
};
