import React, { useState, useEffect } from 'react';

const ConnectionTest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    {
      name: 'Environment Variables',
      test: () => {
        return {
          VITE_API_URL: import.meta.env.VITE_API_URL,
          VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
          VITE_RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID,
          NODE_ENV: import.meta.env.MODE
        };
      }
    },
    {
      name: 'Backend Root',
      url: import.meta.env.VITE_BACKEND_URL || 'https://project-buzzv1-2.onrender.com'
    },
    {
      name: 'API Root',
      url: (import.meta.env.VITE_API_URL || 'https://project-buzzv1-2.onrender.com/api')
    },
    {
      name: 'Projects Endpoint',
      url: (import.meta.env.VITE_API_URL || 'https://project-buzzv1-2.onrender.com/api') + '/projects'
    }
  ];

  const runTests = async () => {
    setLoading(true);
    const testResults = [];

    for (const endpoint of testEndpoints) {
      try {
        if (endpoint.test) {
          // Environment variables test
          const envVars = endpoint.test();
          testResults.push({
            name: endpoint.name,
            status: 'success',
            data: envVars,
            message: 'Environment variables loaded'
          });
        } else {
          // API endpoint test
          console.log(`Testing: ${endpoint.url}`);
          
          const response = await fetch(endpoint.url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          
          testResults.push({
            name: endpoint.name,
            status: response.ok ? 'success' : 'error',
            statusCode: response.status,
            url: endpoint.url,
            data: data,
            message: response.ok ? 'Connection successful' : `HTTP ${response.status}`
          });
        }
      } catch (error) {
        testResults.push({
          name: endpoint.name,
          status: 'error',
          url: endpoint.url,
          error: error.message,
          message: 'Connection failed'
        });
      }
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🔧 Frontend-Backend Connection Test
        </h1>
        
        <div className="mb-6 text-center">
          <button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Run Tests Again'}
          </button>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.status === 'success'
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-red-500 bg-red-900/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{result.name}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    result.status === 'success'
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {result.status === 'success' ? '✅ Success' : '❌ Failed'}
                </span>
              </div>
              
              {result.url && (
                <p className="text-gray-300 text-sm mb-2">
                  <strong>URL:</strong> {result.url}
                </p>
              )}
              
              {result.statusCode && (
                <p className="text-gray-300 text-sm mb-2">
                  <strong>Status:</strong> {result.statusCode}
                </p>
              )}
              
              <p className="text-gray-300 text-sm mb-2">
                <strong>Message:</strong> {result.message}
              </p>
              
              {result.error && (
                <p className="text-red-400 text-sm mb-2">
                  <strong>Error:</strong> {result.error}
                </p>
              )}
              
              {result.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
                    Show Response Data
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-800 rounded text-xs overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">🔍 Debugging Tips:</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Check if environment variables are set correctly in Vercel</li>
            <li>• Verify CORS settings in backend allow your Vercel domain</li>
            <li>• Check browser console for CORS or network errors</li>
            <li>• Ensure backend is not sleeping (Render free tier)</li>
            <li>• Test backend URL directly in browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
