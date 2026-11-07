// src/components/ImportContentButton.jsx
import React, { useRef, useState } from 'react';
import { importContentFromFile } from '../utils/db';

export default function ImportContentButton() {
  const fileInputRef = useRef();
  const [status, setStatus] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('Importing...');
    try {
      // If .txt, read as text and convert to JSON
      if (file.name.endsWith('.txt')) {
        const text = await file.text();
        let jsonObj;
        try {
          jsonObj = JSON.parse(text);
        } catch (parseErr) {
          setStatus('Import failed: The .txt file does not contain valid JSON.');
          fileInputRef.current.value = '';
          return;
        }
        // Convert parsed JSON back to a Blob/File for importContentFromFile
        const blob = new Blob([JSON.stringify(jsonObj)], { type: 'application/json' });
        const jsonFile = new File([blob], file.name.replace(/\.txt$/, '.json'), { type: 'application/json' });
        await importContentFromFile(jsonFile);
      } else {
        await importContentFromFile(file);
      }
      setStatus('Import successful!');
    } catch (err) {
      setStatus('Import failed: ' + err.message);
    }
    fileInputRef.current.value = '';
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
        onClick={() => fileInputRef.current.click()}
      >
        Import Content
      </button>
      <input
        type="file"
        accept=".json,.txt,application/json,text/plain"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {status && <div className="mt-2 text-sm">{status}</div>}
    </div>
  );
}
