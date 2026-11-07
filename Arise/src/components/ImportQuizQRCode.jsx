// src/components/ImportQuizQRCode.jsx
import React, { useRef, useState } from 'react';
import { addQuiz } from '../utils/db';

export default function ImportQuizQRCode() {
  const [status, setStatus] = useState('');
  const fileInputRef = useRef();

  // Use a QR code scanner library (e.g., html5-qrcode or react-qr-reader)
  // For simplicity, this version lets user upload a QR screenshot or image
  // For real camera scanning, integrate react-qr-reader or similar

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('Scanning...');
    try {
      // Dynamically import jsQR for QR decoding
      const jsQR = (await import('jsqr')).default;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const img = new window.Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, img.width, img.height);
          if (code && code.data) {
            try {
              const quiz = JSON.parse(code.data);
              await addQuiz(quiz);
              setStatus('Quiz imported successfully!');
            } catch (err) {
              setStatus('Invalid quiz data in QR.');
            }
          } else {
            setStatus('No QR code found in image.');
          }
        };
        img.onerror = () => setStatus('Failed to load image.');
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setStatus('Error: ' + err.message);
    }
    fileInputRef.current.value = '';
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700 transition"
        onClick={() => fileInputRef.current.click()}
      >
        Import Quiz from QR Image
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {status && <div className="mt-2 text-sm">{status}</div>}
    </div>
  );
}
