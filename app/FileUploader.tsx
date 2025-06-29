import React, { useRef } from 'react';
// @ts-expect-error: No types for papaparse
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { z } from 'zod';

// Minimal type for Papa.ParseResult to fix linter error
// Remove if you add @types/papaparse
namespace Papa {
  export interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: any;
  }
}

interface FileUploaderProps {
  onDataParsed: (data: any[], fileType: 'csv' | 'xlsx', errors: string[]) => void;
}

// Example schema: adjust fields as needed for clients, workers, or tasks
const rowSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required'),
  // Add more fields as needed
});

const validateData = (data: any[]): string[] => {
  const errors: string[] = [];
  data.forEach((row, idx) => {
    const result = rowSchema.safeParse(row);
    if (!result.success) {
      errors.push(`Row ${idx + 1}: ` + result.error.errors.map(e => e.message).join(', '));
    }
  });
  // Example: check for duplicate IDs
  const ids = data.map(row => row.id);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicates.length > 0) {
    errors.push('Duplicate IDs found: ' + Array.from(new Set(duplicates)).join(', '));
  }
  return errors;
};

const FileUploader: React.FC<FileUploaderProps> = ({ onDataParsed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<any>) => {
          const data = results.data as any[];
          const errors = validateData(data);
          onDataParsed(data, 'csv', errors);
        },
        error: (err: { message: string }) => {
          setError('CSV parsing error: ' + err.message);
        },
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        const errors = validateData(jsonData as any[]);
        onDataParsed(jsonData as any[], 'xlsx', errors);
      };
      reader.onerror = () => setError('XLSX file reading error');
      reader.readAsArrayBuffer(file);
    } else {
      setError('Unsupported file type. Please upload a CSV or XLSX file.');
    }
  };

  return (
    <div style={{ margin: '1rem 0' }}>
      <input
        type="file"
        accept=".csv, .xlsx, .xls"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
};

export default FileUploader; 