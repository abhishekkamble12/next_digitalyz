"use client";
import React from "react";
// @ts-expect-error: No types for file-saver
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
// @ts-expect-error: No types for papaparse
import Papa from "papaparse";
import { Rule } from "./RulesManager";

interface ExportButtonsProps {
  data: any[];
  rules: Rule[];
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data, rules }) => {
  const handleExportCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "cleaned_data.csv");
  };

  const handleExportXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const xlsxBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([xlsxBuffer], { type: "application/octet-stream" });
    saveAs(blob, "cleaned_data.xlsx");
  };

  const handleExportRules = () => {
    const json = JSON.stringify(rules, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    saveAs(blob, "business_rules.json");
  };

  return (
    <div className="flex gap-4 mt-4">
      <button
        onClick={handleExportCSV}
        className="bg-green-500 text-white rounded px-3 py-1 hover:bg-green-600"
      >
        Export Data (CSV)
      </button>
      <button
        onClick={handleExportXLSX}
        className="bg-blue-500 text-white rounded px-3 py-1 hover:bg-blue-600"
      >
        Export Data (XLSX)
      </button>
      <button
        onClick={handleExportRules}
        className="bg-gray-700 text-white rounded px-3 py-1 hover:bg-gray-800"
      >
        Export Rules (JSON)
      </button>
    </div>
  );
};

export default ExportButtons; 