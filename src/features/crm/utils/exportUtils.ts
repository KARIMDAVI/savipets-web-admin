/**
 * CRM Export Utilities
 * 
 * Utilities for exporting CRM data to CSV, Excel, and PDF formats.
 */

import type { User, Booking } from '@/types';
import type { ClientNote } from '../types/crm.types';

// Dynamic imports for optional dependencies
let XLSX: any = null;
let jsPDF: any = null;

// Lazy load XLSX
const loadXLSX = async () => {
  if (!XLSX) {
    try {
      XLSX = await import('xlsx');
    } catch (error) {
      console.warn('XLSX library not available. Excel export disabled.');
    }
  }
  return XLSX;
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
 */
export const exportClientsToExcel = async (
  clients: User[],
  bookings: Booking[],
  notes: ClientNote[]
): Promise<void> => {
  const XLSXLib = await loadXLSX();
  if (!XLSXLib) {
    throw new Error('XLSX library not available. Please install xlsx package.');
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

  const workbook = XLSXLib.utils.book_new();
  const worksheet = XLSXLib.utils.json_to_sheet(exportData);
  
  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Client ID
    { wch: 15 }, // First Name
    { wch: 15 }, // Last Name
    { wch: 25 }, // Email
    { wch: 15 }, // Phone
    { wch: 15 }, // Total Bookings
    { wch: 12 }, // Total Spent
    { wch: 18 }, // Last Booking Date
    { wch: 12 }, // Notes Count
    { wch: 15 }, // Account Created
    { wch: 10 }, // Status
    { wch: 10 }, // Rating
  ];
  worksheet['!cols'] = columnWidths;

  XLSXLib.utils.book_append_sheet(workbook, worksheet, 'Clients');
  
  const timestamp = new Date().toISOString().split('T')[0];
  XLSXLib.writeFile(workbook, `crm-clients-${timestamp}.xlsx`);
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


