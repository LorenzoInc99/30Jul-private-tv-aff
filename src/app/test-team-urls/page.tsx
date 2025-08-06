import { slugify, suggestTeamUrl } from '../../lib/utils';

export default function TestTeamUrls() {
  const testTeams = [
    'FC København',
    'Malmö FF',
    'IFK Göteborg',
    'Manchester United',
    'Real Madrid',
    'Atlético Madrid',
    'Paris Saint-Germain',
    'Bayern München',
    'Borussia Mönchengladbach',
    '1. FC Köln',
    'FC Nürnberg',
    'Hamburger SV',
    'VfB Stuttgart',
    'FC Schalke 04',
    'Bayer 04 Leverkusen',
    '1. FC Kaiserslautern',
    'Eintracht Frankfurt',
    'VfL Wolfsburg',
    'Hertha BSC',
    'FC Augsburg',
    'SC Freiburg',
    '1. FSV Mainz 05',
    'TSG 1899 Hoffenheim',
    'FC Union Berlin',
    'VfL Bochum',
    'Arminia Bielefeld',
    'SpVgg Greuther Fürth',
    'FC St. Pauli',
    '1. FC Heidenheim',
    'SV Darmstadt 98',
    '1. FC Nürnberg',
    'FC Hansa Rostock',
    '1. FC Magdeburg',
    'FC Erzgebirge Aue',
    '1. FC Kaiserslautern',
    'FC Carl Zeiss Jena',
    '1. FC Lokomotive Leipzig',
    'FC Rot-Weiß Erfurt',
    '1. FC Union Berlin',
    'FC Energie Cottbus',
    '1. FC Dynamo Dresden',
    'FC Hansa Rostock',
    '1. FC Magdeburg',
    'FC Erzgebirge Aue',
    '1. FC Kaiserslautern',
    'FC Carl Zeiss Jena',
    '1. FC Lokomotive Leipzig',
    'FC Rot-Weiß Erfurt',
    '1. FC Union Berlin',
    'FC Energie Cottbus',
    '1. FC Dynamo Dresden',
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Team URL Testing</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">How Team URLs Work</h2>
        <p className="text-gray-600 mb-4">
          Special characters like "ø", "ö", "ü", "ä", "ß" are converted to their closest Latin equivalents:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>ø</strong> → <strong>o</strong> (Danish/Norwegian)</li>
          <li><strong>ö</strong> → <strong>o</strong> (German/Swedish)</li>
          <li><strong>ü</strong> → <strong>u</strong> (German)</li>
          <li><strong>ä</strong> → <strong>a</strong> (German/Swedish)</li>
          <li><strong>ß</strong> → <strong>ss</strong> (German)</li>
          <li><strong>æ</strong> → <strong>ae</strong> (Danish/Norwegian)</li>
          <li><strong>å</strong> → <strong>aa</strong> (Danish/Norwegian)</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Common Team URL Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testTeams.slice(0, 15).map((team, index) => {
            const slug = slugify(team);
            const suggested = suggestTeamUrl(slug);
            return (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-bold text-sm mb-2">{team}</h3>
                <p className="text-xs text-gray-600 mb-1">
                  <strong>URL:</strong> <code className="bg-gray-200 px-1 rounded">/team/{slug}</code>
                </p>
                {suggested !== slug && (
                  <p className="text-xs text-blue-600">
                    <strong>Suggested:</strong> <code className="bg-blue-100 px-1 rounded">/team/{suggested}</code>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Common Mistakes & Solutions</h2>
        <div className="space-y-2">
          <div className="border-l-4 border-red-500 pl-4">
            <p className="font-bold text-red-700">❌ Wrong: /team/fckbenhavn</p>
            <p className="text-sm text-gray-600">Missing the "o" from "kobenhavn"</p>
            <p className="font-bold text-green-700">✅ Correct: /team/fckobenhavn</p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <p className="font-bold text-red-700">❌ Wrong: /team/malm</p>
            <p className="text-sm text-gray-600">Missing the "o" from "malmö"</p>
            <p className="font-bold text-green-700">✅ Correct: /team/malmo</p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <p className="font-bold text-red-700">❌ Wrong: /team/goteborg</p>
            <p className="text-sm text-gray-600">Missing the "ö" from "göteborg"</p>
            <p className="font-bold text-green-700">✅ Correct: /team/goteborg</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">All Team URLs</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Team Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Correct URL</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Common Mistakes</th>
              </tr>
            </thead>
            <tbody>
              {testTeams.map((team, index) => {
                const slug = slugify(team);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{team}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <code className="bg-gray-200 px-2 py-1 rounded text-sm">/team/{slug}</code>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                      {team.includes('ø') && 'Missing "o"'}
                      {team.includes('ö') && 'Missing "o"'}
                      {team.includes('ü') && 'Missing "u"'}
                      {team.includes('ä') && 'Missing "a"'}
                      {team.includes('ß') && 'Use "ss" instead'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 