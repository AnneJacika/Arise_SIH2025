// src/components/ExportContentButton.jsx
import React from 'react';
import { exportContent } from '../utils/db';

export default function ExportContentButton() {
  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      onClick={() => exportContent()}
    >
      Export All Content
    </button>
  );
}
