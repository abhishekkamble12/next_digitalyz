"use client";
import Image from "next/image";
import React, { useState } from "react";
import FileUploader from "./FileUploader";
import EditableGrid from "./DataGrid";
import RulesManager, { Rule } from "./RulesManager";
import { z } from "zod";
import ExportButtons from "./ExportButtons";

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

export default function Home() {
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'xlsx' | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [filterText, setFilterText] = useState("");
  
  // For grid error highlighting
  const errorRows = React.useMemo(() => {
    if (!parsedData) return [];
    const rowsWithError: number[] = [];
    parsedData.forEach((row, idx) => {
      const result = rowSchema.safeParse(row);
      if (!result.success) rowsWithError.push(idx);
    });
    return rowsWithError;
  }, [parsedData]);

  // Dynamically generate columns from data
  const columns = React.useMemo(() => {
    if (!parsedData || parsedData.length === 0) return [];
    return Object.keys(parsedData[0]).map((key) => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      editable: true,
      resizable: true,
      width: 150,
    }));
  }, [parsedData]);

  // Extract unique workers, clients, tasks from data for dropdowns
  const workers = React.useMemo(() => parsedData ? Array.from(new Set(parsedData.map(row => row.worker || row.name || row.id))) : [], [parsedData]);
  const clients = React.useMemo(() => parsedData ? Array.from(new Set(parsedData.map(row => row.client))) : [], [parsedData]);
  const tasks = React.useMemo(() => parsedData ? Array.from(new Set(parsedData.map(row => row.task))) : [], [parsedData]);

  // Build errorMap for cell-level errors
  const errorMap = React.useMemo(() => {
    if (!parsedData) return {};
    const map: Record<string, string> = {};
    parsedData.forEach((row, rowIdx) => {
      const result = rowSchema.safeParse(row);
      if (!result.success) {
        result.error.errors.forEach(err => {
          if (err.path.length > 0) {
            map[`${rowIdx}-${err.path[0]}`] = err.message;
          }
        });
      }
    });
    // Duplicate ID error (row-level, show on id cell)
    const ids = parsedData.map(row => row.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (duplicates.length > 0) {
      parsedData.forEach((row, rowIdx) => {
        if (duplicates.includes(row.id)) {
          map[`${rowIdx}-id`] = 'Duplicate ID';
        }
      });
    }
    return map;
  }, [parsedData]);

  return (
    <div className="flex flex-col items-center min-h-screen p-8 pb-20 gap-0 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-black dark:bg-black">
      <main className="flex flex-col gap-0 row-start-2 items-center sm:items-start w-full">
        <h1 className="text-2xl font-bold mb-4">File Upload and Parsing</h1>
        <div className="w-45 h-auto  ">
          <h1 className="font-bold text-3xl">Instructions</h1>
          <ul className="list-disc pl-5 w-full max-w-2xl text-sm">
            <li>Upload a CSV or XLSX file containing data.</li>
            <li>Data will be parsed and displayed in a grid.</li>
            <li>Edit the data directly in the grid.</li>
            <li>Define rules for validation and processing.</li>
            <li>Export the modified data and rules as needed.</li>
          </ul>
        </div>
        <FileUploader
          onDataParsed={(data, type, errors) => {
            setParsedData(data);
            setFileType(type);
            setValidationErrors(errors);
          }}
        />
        {parsedData && (
          <>
            <div className="w-full max-w-2xl mb-6">
              <EditableGrid
                columns={columns}
                rows={parsedData}
                onRowsChange={(rows) => {
                  setParsedData(rows);
                  setValidationErrors(validateData(rows));
                }}
                errorMap={errorMap}
                filterText={filterText}
                onFilterTextChange={setFilterText}
              />
            </div>
            <div className="w-full max-w-2xl mb-6">
              <RulesManager
                workers={workers}
                clients={clients}
                tasks={tasks}
                rules={rules}
                onRulesChange={setRules}
              />
            </div>
            <div className="w-full max-w-2xl mb-6 flex flex-col items-start">
              <ExportButtons data={parsedData} rules={rules} />
            </div>
          </>
        )}
        {validationErrors.length > 0 && (
          <div className="w-full max-w-2xl bg-red-100 dark:bg-red-900 rounded p-6 mt-6 mb-6 text-sm text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800">
            <div className="mb-2 font-semibold text-red-700 dark:text-red-200">Validation Errors:</div>
            <ul className="list-disc pl-5 space-y-1">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
