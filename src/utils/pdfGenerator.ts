
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
}

export const generateInvoicePDF = async (invoice: Invoice) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  
  // Header
  pdf.setFillColor(37, 99, 235); // Blue background
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('HAUL-IT INVOICE PRO', margin, 25);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Professional Trucking Services', margin, 35);
  
  // Company Info (right side)
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  const companyInfo = [
    'Your Company Name',
    'Address Line 1',
    'City, State ZIP',
    'Phone: (555) 123-4567',
    'Email: info@company.com'
  ];
  
  let yPos = 15;
  companyInfo.forEach(line => {
    pdf.text(line, pageWidth - margin, yPos, { align: 'right' });
    yPos += 5;
  });
  
  // Reset text color for body
  pdf.setTextColor(0, 0, 0);
  
  // Invoice Title and Number
  yPos = 60;
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', margin, yPos);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - margin, yPos, { align: 'right' });
  pdf.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, pageWidth - margin, yPos + 7, { align: 'right' });
  
  // Broker Information
  yPos += 30;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bill To:', margin, yPos);
  
  yPos += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoice.broker, margin, yPos);
  
  // Load Details Section
  yPos += 30;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Load Details', margin, yPos);
  
  // Draw line under header
  yPos += 5;
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 15;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const loadDetails = [
    ['Load Number:', invoice.loadNumber],
    ['Driver:', invoice.driver],
    ['Truck Number:', invoice.truckNumber],
    ['Pickup Location:', invoice.pickupLocation],
    ['Delivery Location:', invoice.deliveryLocation],
    ['Pickup Date:', invoice.pickupDate ? new Date(invoice.pickupDate).toLocaleDateString() : 'N/A'],
    ['Delivery Date:', invoice.deliveryDate ? new Date(invoice.deliveryDate).toLocaleDateString() : 'N/A'],
  ];
  
  loadDetails.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, margin, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, margin + 40, yPos);
    yPos += 8;
  });
  
  // Services Table Header
  yPos += 20;
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 15, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Description', margin + 5, yPos + 5);
  pdf.text('Amount', pageWidth - margin - 30, yPos + 5, { align: 'right' });
  
  // Service Line
  yPos += 20;
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Freight Transportation - Load ${invoice.loadNumber}`, margin + 5, yPos);
  pdf.text(`$${invoice.rate.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });
  
  // Total Section
  yPos += 30;
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth - 100, yPos, pageWidth - margin, yPos);
  
  yPos += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Total Amount:', pageWidth - 80, yPos);
  pdf.text(`$${invoice.rate.toFixed(2)}`, pageWidth - margin - 5, yPos, { align: 'right' });
  
  // Payment Status
  if (invoice.status !== 'unpaid') {
    yPos += 20;
    pdf.setFillColor(220, 252, 231); // Light green background
    pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 25, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Payment Information', margin + 5, yPos + 5);
    
    yPos += 12;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Status: ${invoice.status === 'paid' ? 'PAID IN FULL' : 'PARTIAL PAYMENT'}`, margin + 5, yPos);
    
    if (invoice.paymentMethod) {
      yPos += 6;
      pdf.text(`Method: ${invoice.paymentMethod}`, margin + 5, yPos);
    }
    
    if (invoice.paymentDate) {
      yPos += 6;
      pdf.text(`Date: ${new Date(invoice.paymentDate).toLocaleDateString()}`, margin + 5, yPos);
    }
    
    if (invoice.paidAmount) {
      pdf.text(`Amount: $${invoice.paidAmount.toFixed(2)}`, pageWidth - margin - 50, yPos - 6, { align: 'right' });
    }
  }
  
  // Notes Section
  if (invoice.notes) {
    yPos += 30;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Notes:', margin, yPos);
    
    yPos += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    // Split notes into lines to fit width
    const noteLines = pdf.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
    pdf.text(noteLines, margin, yPos);
  }
  
  // Footer
  const footerY = pdf.internal.pageSize.height - 30;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(128, 128, 128);
  pdf.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  pdf.text('Payment terms: Net 30 days', pageWidth / 2, footerY + 5, { align: 'center' });
  
  // Save the PDF
  pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
};
