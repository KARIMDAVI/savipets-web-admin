/**
 * CRM Import Utilities
 * 
 * Utilities for importing client data from CSV files with validation.
 */

import type { User } from '@/types';

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value?: unknown;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ImportError[];
  data: Partial<User>[];
}

export interface ImportPreview {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

/**
 * Parse CSV file content
 */
export const parseCSV = (csvContent: string): string[][] => {
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      currentLine.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // Line separator
      if (currentField || currentLine.length > 0) {
        currentLine.push(currentField.trim());
        currentField = '';
        if (currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = [];
        }
      }
      // Skip \r\n combination
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      currentField += char;
    }
  }

  // Add last field and line
  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim());
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (basic)
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Validate required fields
 */
export const validateRequiredFields = (row: Record<string, string>): ImportError[] => {
  const errors: ImportError[] = [];
  const requiredFields = ['email', 'firstName'];

  requiredFields.forEach((field) => {
    if (!row[field] || row[field].trim() === '') {
      errors.push({
        row: 0, // Will be set by caller
        field,
        message: `${field} is required`,
        value: row[field],
      });
    }
  });

  return errors;
};

/**
 * Validate row data
 */
export const validateRow = (
  row: Record<string, string>,
  rowIndex: number
): ImportError[] => {
  const errors: ImportError[] = [];

  // Validate required fields
  errors.push(...validateRequiredFields(row).map((e) => ({ ...e, row: rowIndex })));

  // Validate email
  if (row.email && !validateEmail(row.email)) {
    errors.push({
      row: rowIndex,
      field: 'email',
      message: 'Invalid email format',
      value: row.email,
    });
  }

  // Validate phone
  if (row.phoneNumber && !validatePhone(row.phoneNumber)) {
    errors.push({
      row: rowIndex,
      field: 'phoneNumber',
      message: 'Invalid phone number format',
      value: row.phoneNumber,
    });
  }

  return errors;
};

/**
 * Map CSV row to User object
 */
export const mapRowToUser = (row: Record<string, string>): Partial<User> => {
  return {
    email: row.email?.trim() || '',
    firstName: row.firstName?.trim() || '',
    lastName: row.lastName?.trim() || '',
    phoneNumber: row.phoneNumber?.trim() || undefined,
    role: 'petOwner', // Default role for imported clients
    isActive: row.isActive?.toLowerCase() === 'false' ? false : true,
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
  };
};

/**
 * Import clients from CSV content
 */
export const importClientsFromCSV = (csvContent: string): ImportResult => {
  const lines = parseCSV(csvContent);
  
  if (lines.length === 0) {
    return {
      success: false,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      errors: [
        {
          row: 0,
          field: 'file',
          message: 'CSV file is empty',
        },
      ],
      data: [],
    };
  }

  // First line is headers
  const headers = lines[0].map((h) => h.toLowerCase().trim());
  const dataRows = lines.slice(1);

  const errors: ImportError[] = [];
  const validData: Partial<User>[] = [];

  dataRows.forEach((row, index) => {
    // Map row to object
    const rowObj: Record<string, string> = {};
    headers.forEach((header, colIndex) => {
      rowObj[header] = row[colIndex] || '';
    });

    // Validate row
    const rowErrors = validateRow(rowObj, index + 2); // +2 because index is 0-based and we skip header

    if (rowErrors.length === 0) {
      validData.push(mapRowToUser(rowObj));
    } else {
      errors.push(...rowErrors);
    }
  });

  return {
    success: errors.length === 0,
    totalRows: dataRows.length,
    validRows: validData.length,
    invalidRows: errors.length,
    errors,
    data: validData,
  };
};

/**
 * Preview CSV file before import
 */
export const previewCSV = (csvContent: string, maxRows: number = 10): ImportPreview => {
  const lines = parseCSV(csvContent);
  
  if (lines.length === 0) {
    return {
      headers: [],
      rows: [],
      totalRows: 0,
    };
  }

  const headers = lines[0];
  const previewRows = lines.slice(1, maxRows + 1);
  const totalRows = lines.length - 1; // Exclude header

  return {
    headers,
    rows: previewRows,
    totalRows,
  };
};

/**
 * Expected CSV headers
 */
export const EXPECTED_HEADERS = [
  'email',
  'firstName',
  'lastName',
  'phoneNumber',
  'isActive',
  'createdAt',
];

/**
 * Validate CSV headers
 */
export const validateHeaders = (headers: string[]): ImportError[] => {
  const errors: ImportError[] = [];
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());
  const requiredHeaders = ['email', 'firstname'];

  requiredHeaders.forEach((required) => {
    if (!normalizedHeaders.includes(required)) {
      errors.push({
        row: 0,
        field: 'headers',
        message: `Missing required header: ${required}`,
      });
    }
  });

  return errors;
};

