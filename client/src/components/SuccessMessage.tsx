import React from 'react';
import { CheckCircle } from 'lucide-react';

export function SuccessMessage() {
  return (
    <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-50">
      <CheckCircle className="h-6 w-6" />
      <div>
        <h3 className="font-semibold">Authentication Success!</h3>
        <p className="text-sm opacity-90">Wallet connected and authenticated successfully</p>
      </div>
    </div>
  );
}