import React, { useState } from 'react';

const qrCodeImagePath = '/photo_2025-03-28 13.45.48.jpeg';

const SupportSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Main Section */}
      <div className="flex items-center gap-4 p-4 border-t mt-8">
        <div className="flex-shrink-0">
          {qrCodeImagePath ? (
            <img
              src={qrCodeImagePath}
              alt="Support QR Code"
              className="w-20 h-20 object-contain rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                console.error("Failed to load QR code image:", qrCodeImagePath);
              }}
            />
          ) : (
            <div className="w-20 h-20 flex items-center justify-center border rounded-md bg-muted">
              <p className="text-xs text-muted-foreground text-center">QR Code Error</p>
            </div>
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">
            If you find this app helpful, consider supporting its development. Your contribution helps keep the app ad-free!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-block px-4 py-2 mt-2 text-sm font-semibold text-white bg-amber-500 rounded-md hover:bg-amber-600"
          >
            Buy Me a Coffee ☕
          </button>
        </div>
      </div>

      {/* Modal for Enlarged QR Code */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <img
              src={qrCodeImagePath}
              alt="Enlarged QR Code"
              className="w-64 h-64 object-contain rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                console.error("Failed to load QR code image:", qrCodeImagePath);
              }}
            />
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportSection;
