"use client";
import React, { useState, useMemo } from "react";
import { DataGrid, Column, textEditor } from "react-data-grid";

interface DataGridProps {
  columns: Column<any>[];
  rows: any[];
  onRowsChange: (rows: any[]) => void;
  errorMap?: Record<string, string>; // key: `${rowIdx}-${colKey}`
  filterText?: string;
  onFilterTextChange?: (text: string) => void;
}

const EditableGrid: React.FC<DataGridProps> = ({ columns, rows, onRowsChange, errorMap = {}, filterText = '', onFilterTextChange }) => {
  // Filter rows by search text
  const filteredRows = useMemo(() => {
    if (!filterText) return rows;
    return rows.filter(row =>
      Object.values(row).some(val => String(val).toLowerCase().includes(filterText.toLowerCase()))
    );
  }, [rows, filterText]);

  // Enhance columns to show error tooltips and red background
  const enhancedColumns = columns.map(col => ({
    ...col,
    editor: textEditor,
    renderCell: (props: any) => {
      const errorKey = `${props.rowIdx}-${col.key}`;
      const error = errorMap[errorKey];
      return (
        <div
          style={{
            background: error ? '#fee2e2' : undefined,
            color: error ? '#b91c1c' : undefined,
            position: 'relative',
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
          title={error || ''}
        >
          {props.row[col.key]}
          {error && (
            <span style={{ marginLeft: 4, fontSize: 12, color: '#b91c1c' }} title={error}>⚠️</span>
          )}
        </div>
      );
    },
  }));

  return (
    <div style={{ width: '100%', maxWidth: 900, height: 400 }}>
      <div className="mb-2 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Search..."
          value={filterText}
          onChange={e => onFilterTextChange?.(e.target.value)}
          className="border rounded p-1 w-64"
        />
      </div>
      <DataGrid
        columns={enhancedColumns}
        rows={filteredRows}
        onRowsChange={onRowsChange}
        className="rdg-light"
      />
    </div>
  );
};

export default EditableGrid; 