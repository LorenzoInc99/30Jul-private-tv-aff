import { slugify } from '../../lib/utils';

export default function TestTeamLinks() {
  const testTeams = [
    'FC København',
    'Malmö FF',
    'IFK Göteborg',
    'Bayern München',
    'Borussia Mönchengladbach',
    'Manchester United',
    'Real Madrid',
    'Atlético Madrid',
    'Paris Saint-Germain',
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Team Link Generation Test</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">How Team Links Are Generated</h2>
        <p className="text-gray-600 mb-4">
          When you click on a team name anywhere on the website, it should generate the correct URL with proper character conversion.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Team Links (Click to Test)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testTeams.map((team, index) => {
            const slug = slugify(team);
            return (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-bold text-sm mb-2">{team}</h3>
                <p className="text-xs text-gray-600 mb-2">
                  <strong>Generated URL:</strong> <code className="bg-gray-200 px-1 rounded">/team/{slug}</code>
                </p>
                <a 
                  href={`/team/${slug}`}
                  className="inline-block bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Test Link
                </a>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Character Conversion Examples</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Original Team Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Generated URL</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Character Changes</th>
              </tr>
            </thead>
            <tbody>
              {testTeams.map((team, index) => {
                const slug = slugify(team);
                const changes = [];
                if (team.includes('ø')) changes.push('ø → o');
                if (team.includes('ö')) changes.push('ö → o');
                if (team.includes('ü')) changes.push('ü → u');
                if (team.includes('ä')) changes.push('ä → a');
                if (team.includes('ß')) changes.push('ß → ss');
                if (team.includes('æ')) changes.push('æ → ae');
                if (team.includes('å')) changes.push('å → aa');
                if (team.includes(' ')) changes.push('spaces removed');
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{team}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <code className="bg-gray-200 px-2 py-1 rounded text-sm">/team/{slug}</code>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                      {changes.join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Expected Behavior</h2>
        <div className="space-y-2">
          <div className="border-l-4 border-green-500 pl-4">
            <p className="font-bold text-green-700">✅ Correct: Clicking "FC København" → /team/fckobenhavn</p>
            <p className="text-sm text-gray-600">The "ø" is converted to "o" in the URL</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <p className="font-bold text-green-700">✅ Correct: Clicking "Malmö FF" → /team/malmoff</p>
            <p className="text-sm text-gray-600">The "ö" is converted to "o" in the URL</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <p className="font-bold text-green-700">✅ Correct: Clicking "Bayern München" → /team/bayernmunchen</p>
            <p className="text-sm text-gray-600">The "ü" is converted to "u" in the URL</p>
          </div>
        </div>
      </div>
    </div>
  );
} 