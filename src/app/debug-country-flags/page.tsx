'use client';

import { useState, useEffect } from 'react';

export default function DebugCountryFlags() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/debug-country');
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="container mx-auto p-8">Loading...</div>;
  if (error) return <div className="container mx-auto p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Scottish Premiership Flag Issue</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Scottish Premiership League:</h2>
        <div className="p-4 border rounded bg-yellow-50">
          <h3 className="font-semibold mb-2">League: Premiership</h3>
          <div className="mb-2">
            <strong>League ID:</strong> 501
          </div>
          <div className="mb-2">
            <strong>Country ID:</strong> 1161
          </div>
          <div className="mb-2">
            <strong>Sport ID:</strong> 1
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Country ID 1161 (Current):</h2>
        {data?.country1161 ? (
          <div className="p-4 border rounded bg-red-50">
            <h3 className="font-semibold mb-2">Country: {data.country1161.name}</h3>
            <div className="mb-2">
              <strong>Country ID:</strong> {data.country1161.id}
            </div>
            <div className="mb-2">
              <strong>Flag URL:</strong> {data.country1161.image_path || 'No flag URL'}
            </div>
            {data.country1161.image_path && (
              <img 
                src={data.country1161.image_path} 
                alt={data.country1161.name}
                className="w-12 h-8 border rounded"
                onError={(e) => {
                  console.error('Flag failed to load:', data.country1161.image_path);
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(data.country1161, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-red-500">
            Country ID 1161 not found. Error: {data?.errors?.country1161}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Scotland Country (Correct):</h2>
        {data?.scotland ? (
          <div className="p-4 border rounded bg-green-50">
            <h3 className="font-semibold mb-2">Country: {data.scotland.name}</h3>
            <div className="mb-2">
              <strong>Country ID:</strong> {data.scotland.id}
            </div>
            <div className="mb-2">
              <strong>Flag URL:</strong> {data.scotland.image_path || 'No flag URL'}
            </div>
            {data.scotland.image_path && (
              <img 
                src={data.scotland.image_path} 
                alt={data.scotland.name}
                className="w-12 h-8 border rounded"
                onError={(e) => {
                  console.error('Scotland flag failed to load:', data.scotland.image_path);
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(data.scotland, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-red-500">
            Scotland country not found. Error: {data?.errors?.scotland}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Seychelles Country:</h2>
        {data?.seychelles ? (
          <div className="p-4 border rounded bg-blue-50">
            <h3 className="font-semibold mb-2">Country: {data.seychelles.name}</h3>
            <div className="mb-2">
              <strong>Country ID:</strong> {data.seychelles.id}
            </div>
            <div className="mb-2">
              <strong>Flag URL:</strong> {data.seychelles.image_path || 'No flag URL'}
            </div>
            {data.seychelles.image_path && (
              <img 
                src={data.seychelles.image_path} 
                alt={data.seychelles.name}
                className="w-12 h-8 border rounded"
                onError={(e) => {
                  console.error('Seychelles flag failed to load:', data.seychelles.image_path);
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(data.seychelles, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-yellow-500">
            Seychelles country not found. Error: {data?.errors?.seychelles}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sample Countries:</h2>
        {data?.allCountries && data.allCountries.length > 0 ? (
          <div className="space-y-2">
            {data.allCountries.map((country: any) => (
              <div key={country.id} className="p-2 border rounded text-sm">
                <strong>{country.name}</strong> (ID: {country.id}) - {country.image_path || 'No flag'}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-yellow-500">
            No countries found. Error: {data?.errors?.allCountries}
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Solution:</h2>
        <div className="bg-blue-50 p-4 rounded">
          <p className="mb-2">Based on the data above, the fix will be:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Identify what country ID 1161 actually is (likely Seychelles)</li>
            <li>Find Scotland's correct ID from the data above</li>
            <li>Update the Scottish Premiership league to point to Scotland's ID</li>
            <li>The SQL command will be: <code>UPDATE leagues SET country_id = [SCOTLAND_ID] WHERE id = 501;</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
} 