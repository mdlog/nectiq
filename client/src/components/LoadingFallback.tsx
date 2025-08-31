import React from 'react';

export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Nectiq</h1>
        <p className="text-gray-600 mb-6 max-w-md">
          Initializing your cryptocurrency prediction platform...
        </p>
        <div className="text-sm text-gray-500">
          Please wait while we set up your session
        </div>
      </div>
    </div>
  );
}

export function AppErrorFallback() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <div className="text-center max-w-md p-6">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <h1 className="text-xl font-bold text-red-900 mb-4">Application Error</h1>
        <p className="text-red-700 mb-6">
          We're having trouble loading the application. This usually resolves itself quickly.
        </p>
        <button
          onClick={handleReload}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reload Application
        </button>
        <div className="mt-6 text-sm text-red-600">
          If the problem persists, please check your internet connection.
        </div>
      </div>
    </div>
  );
}