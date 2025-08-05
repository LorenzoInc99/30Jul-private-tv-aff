export default function TestScotlandFlag() {
  const flagUrls = [
    'https://cdn.sportmonks.com/images/countries/png/short/gb-sct.png',
    'https://cdn.sportmonks.com/images/countries/png/short/sc.png',
    'https://cdn.sportmonks.com/images/countries/png/short/scotland.png',
    'https://cdn.sportmonks.com/images/countries/png/short/gb.png',
    'https://cdn.sportmonks.com/images/countries/png/short/uk.png'
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Scotland Flag URLs</h1>
      
      <div className="space-y-4">
        {flagUrls.map((url, index) => (
          <div key={index} className="p-4 border rounded">
            <h3 className="font-semibold mb-2">Test {index + 1}: {url.split('/').pop()}</h3>
            <div className="flex items-center gap-4">
              <img 
                src={url} 
                alt={`Scotland flag test ${index + 1}`}
                className="w-12 h-8 border rounded"
                onError={(e) => {
                  console.error('Flag failed to load:', url);
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.textContent = '❌ Failed to load';
                }}
              />
              <span className="text-sm text-gray-600">{url}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
        <p>Check which flag image displays correctly above. The correct one should show the Scottish flag (blue with white St. Andrew's cross).</p>
        <p>Once you identify the correct URL, we'll update the database adapter.</p>
      </div>
    </div>
  );
} 