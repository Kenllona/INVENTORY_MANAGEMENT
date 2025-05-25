import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const BarcodeScanner = ({ onScan, onClose }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
      },
      (errorMessage) => {
        console.warn("QR scan error:", errorMessage);
      }
    );

    return () => {
      scanner.clear().catch((err) => console.error("Failed to clear scanner", err));
    };
  }, [onScan]);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-lg">
      <h1 className="text-2xl font-bold text-center mb-4 text-indigo-400">Scan Product Barcode</h1>
      <div id="qr-reader" className=""></div>
      <button
        onClick={onClose}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mt-4" >Close </button> 
    </div>
  );
};

export default  BarcodeScanner ;
