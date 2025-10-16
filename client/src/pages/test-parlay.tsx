import React from 'react';

export default function TestParlay() {
    console.log("🧪 [TEST-PARLAY] Component rendering...");

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Test Parlay Page</h1>

                <div className="bg-card p-6 rounded-lg border">
                    <h2 className="text-xl font-semibold mb-4">Parlay Page Test</h2>
                    <p className="text-muted-foreground mb-4">
                        This is a test page to verify that the parlay route is working.
                    </p>

                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                            <h3 className="font-medium text-green-800 dark:text-green-200">✅ Route Working</h3>
                            <p className="text-green-600 dark:text-green-300 text-sm">
                                The parlay route is accessible and rendering correctly.
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <h3 className="font-medium text-blue-800 dark:text-blue-200">🔍 Next Steps</h3>
                            <p className="text-blue-600 dark:text-blue-300 text-sm">
                                If you can see this page, the routing is working. The issue might be with:
                            </p>
                            <ul className="text-blue-600 dark:text-blue-300 text-sm mt-2 list-disc list-inside">
                                <li>Authentication (ProtectedRoute)</li>
                                <li>API endpoints</li>
                                <li>Component dependencies</li>
                                <li>Database connections</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
