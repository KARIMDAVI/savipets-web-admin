/**
 * CRM Export Utilities
 * 
 * Utilities for exporting CRM data to CSV, Excel, and PDF formats.
 * 
 * Migration Note: Replaced xlsx with exceljs (v4.4.0) to address security vulnerabilities.
 * exceljs is actively maintained and has no known vulnerabilities.
 */

import type { User, Booking } from '@/types';
import type { ClientNote } from '../types/crm.types';

// Dynamic imports for optional dependencies
let ExcelJS: any = null;
let jsPDF: any = null;

// Lazy load ExcelJS
const loadExcelJS = async () => {
  if (!ExcelJS) {
    try {
      ExcelJS = await import('exceljs');
    } catch (error) {
      console.warn('ExcelJS library not available. Excel export disabled.');
    }
  }
  return ExcelJS;
};

// Lazy load jsPDF
const loadJsPDF = async () => {
  if (!jsPDF) {
    try {
      const jsPDFModule = await import('jspdf');
      jsPDF = jsPDFModule.default || jsPDFModule;
      // AutoTable plugin would need to be imported separately if needed
    } catch (error) {
      console.warn('jsPDF library not available. PDF export disabled.');
    }
  }
  return jsPDF;
};

/**
 * Convert array of objects to CSV string
 */
export const convertToCSV = (data: Record<string, unknown>[]): string => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      // Handle values that might contain commas or quotes
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma or quote
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

/**
 * Download data as CSV file
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export clients data to CSV
 */
export const exportClientsToCSV = (
  clients: User[],
  bookings: Booking[],
  notes: ClientNote[]
): void => {
  const exportData = clients.map((client) => {
    const clientBookings = bookings.filter((b) => b.clientId === client.id);
    const clientNotes = notes.filter((n) => n.clientId === client.id);
    const totalSpent = clientBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);

    return {
      'Client ID': client.id,
      'First Name': client.firstName || '',
      'Last Name': client.lastName || '',
      'Email': client.email || '',
      'Phone': client.phoneNumber || '',
      'Total Bookings': clientBookings.length,
      'Total Spent': `$${totalSpent.toFixed(2)}`,
      'Last Booking Date': clientBookings.length > 0
        ? clientBookings.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())[0].scheduledDate
        : 'N/A',
      'Notes Count': clientNotes.length,
      'Account Created': client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A',
    };
  });

  const csvContent = convertToCSV(exportData);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `crm-clients-${timestamp}.csv`);
};

/**
 * Export client notes to CSV
 */
export const exportNotesToCSV = (notes: ClientNote[]): void => {
  const exportData = notes.map((note) => ({
    'Note ID': note.id,
    'Client ID': note.clientId,
    'Type': note.type,
    'Priority': note.priority,
    'Content': note.content.replace(/\n/g, ' ').substring(0, 200), // Limit content length
    'Created By': note.createdBy,
    'Created Date': note.createdAt ? new Date(note.createdAt).toLocaleString() : 'N/A',
    'Resolved': note.isResolved ? 'Yes' : 'No',
  }));

  const csvContent = convertToCSV(exportData);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `crm-notes-${timestamp}.csv`);
};

/**
 * Export bookings data to CSV
 */
export const exportBookingsToCSV = (bookings: Booking[]): void => {
  const exportData = bookings.map((booking) => ({
    'Booking ID': booking.id,
    'Client ID': booking.clientId,
    'Sitter ID': booking.sitterId || 'N/A',
    'Service Type': booking.serviceType,
    'Status': booking.status,
    'Scheduled Date': new Date(booking.scheduledDate).toLocaleString(),
    'Price': `$${Number(booking.price).toFixed(2)}`,
    'Duration': booking.duration ? `${booking.duration} minutes` : 'N/A',
    'Created Date': booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A',
  }));

  const csvContent = convertToCSV(exportData);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `crm-bookings-${timestamp}.csv`);
};

/**
 * Export clients data to Excel (XLSX)
 * 
 * Uses exceljs instead of xlsx for better security and maintenance.
 */
export const exportClientsToExcel = async (
  clients: User[],
  bookings: Booking[],
  notes: ClientNote[]
): Promise<void> => {
  const ExcelJSLib = await loadExcelJS();
  if (!ExcelJSLib) {
    throw new Error('ExcelJS library not available. Please install exceljs package.');
  }

  const exportData = clients.map((client) => {
    const clientBookings = bookings.filter((b) => b.clientId === client.id);
    const clientNotes = notes.filter((n) => n.clientId === client.id);
    const totalSpent = clientBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);

    return {
      'Client ID': client.id,
      'First Name': client.firstName || '',
      'Last Name': client.lastName || '',
      'Email': client.email || '',
      'Phone': client.phoneNumber || '',
      'Total Bookings': clientBookings.length,
      'Total Spent': totalSpent,
      'Last Booking Date': clientBookings.length > 0
        ? clientBookings.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())[0].scheduledDate
        : 'N/A',
      'Notes Count': clientNotes.length,
      'Account Created': client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A',
      'Status': client.isActive ? 'Active' : 'Inactive',
      'Rating': client.rating || 'N/A',
    };
  });

  // Create workbook and worksheet using exceljs
  const workbook = new ExcelJSLib.Workbook();
  const worksheet = workbook.addWorksheet('Clients');
  
  // Add headers
  const headers = Object.keys(exportData[0] || {});
  worksheet.addRow(headers);
  
  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Add data rows
  exportData.forEach((row) => {
    worksheet.addRow(Object.values(row));
  });
  
  // Set column widths
  worksheet.columns = [
    { width: 15 }, // Client ID
    { width: 15 }, // First Name
    { width: 15 }, // Last Name
    { width: 25 }, // Email
    { width: 15 }, // Phone
    { width: 15 }, // Total Bookings
    { width: 12 }, // Total Spent
    { width: 18 }, // Last Booking Date
    { width: 12 }, // Notes Count
    { width: 15 }, // Account Created
    { width: 10 }, // Status
    { width: 10 }, // Rating
  ];
  
  // Format Total Spent column as currency
  const totalSpentCol = worksheet.getColumn(7);
  totalSpentCol.numFmt = '$#,##0.00';
  
  // Generate file and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().split('T')[0];
  
  link.setAttribute('href', url);
  link.setAttribute('download', `crm-clients-${timestamp}.xlsx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export clients data to PDF
 */
export const exportClientsToPDF = async (
  clients: User[],
  bookings: Booking[],
  notes: ClientNote[]
): Promise<void> => {
  const jsPDFLib = await loadJsPDF();
  if (!jsPDFLib) {
    throw new Error('jsPDF library not available. Please install jspdf package.');
  }

  const doc = new jsPDFLib('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const rowHeight = 8;
  const startY = 20;
  let currentY = startY;

  // Title
  doc.setFontSize(16);
  doc.text('CRM Clients Export', margin, currentY);
  currentY += 10;

  // Headers
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  const headers = ['Name', 'Email', 'Phone', 'Bookings', 'Total Spent', 'Status'];
  const colWidths = [35, 50, 30, 20, 25, 20];
  let xPos = margin;

  headers.forEach((header, index) => {
    doc.text(header, xPos, currentY);
    xPos += colWidths[index];
  });
  currentY += rowHeight;

  // Data rows
  doc.setFont(undefined, 'normal');
  clients.slice(0, 20).forEach((client) => { // Limit to 20 rows per page
    if (currentY > pageHeight - margin - rowHeight) {
      doc.addPage();
      currentY = startY;
    }

    const clientBookings = bookings.filter((b) => b.clientId === client.id);
    const totalSpent = clientBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);

    xPos = margin;
    const rowData = [
      `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'N/A',
      client.email || 'N/A',
      client.phoneNumber || 'N/A',
      clientBookings.length.toString(),
      `$${totalSpent.toFixed(2)}`,
      client.isActive ? 'Active' : 'Inactive',
    ];

    rowData.forEach((cell, index) => {
      doc.text(cell.substring(0, colWidths[index] / 2), xPos, currentY);
      xPos += colWidths[index];
    });

    currentY += rowHeight;
  });

  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`crm-clients-${timestamp}.pdf`);
};

/**
 * Export format types
 */
export type ExportFormat = 'csv' | 'excel' | 'pdf';

/**
 * Export clients with format selection
 */
export const exportClients = async (
  format: ExportFormat,
  clients: User[],
  bookings: Booking[],
  notes: ClientNote[]
): Promise<void> => {
  switch (format) {
    case 'csv':
      exportClientsToCSV(clients, bookings, notes);
      break;
    case 'excel':
      await exportClientsToExcel(clients, bookings, notes);
      break;
    case 'pdf':
      await exportClientsToPDF(clients, bookings, notes);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};


