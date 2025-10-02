import { useState } from 'react';

export default function DataScraper() {
  const [url, setUrl] = useState('');
  const [scrapedData, setScrapedData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');

  const scrapeData = async () => {
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const text = await response.text();
        alert('Error: ' + text);
        return;
      }

      const data = await response.json();
      if (data.error) {
        alert('Scraping error: ' + data.error);
      } else {
        setScrapedData(data);
        setAnalysis(null);
        setGeneratedCode('');
      }
    } catch (error) {
      alert('Network error: ' + error.message);
    }
  };

  const analyzeData = () => {
    if (!scrapedData) return;

    const words = scrapedData.text.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    const wordFreq = {};
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    setAnalysis({ wordCount, topWords });
  };

  const generateCode = () => {
    if (!scrapedData) return;

    const code = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${scrapedData.title}</title>
</head>
<body>
  <h1>${scrapedData.title}</h1>
  <p>${scrapedData.text.substring(0, 1000)}...</p>
  <h2>Links</h2>
  <ul>
    ${scrapedData.links.map(link => `<li><a href="${link}">${link}</a></li>`).join('')}
  </ul>
</body>
</html>
    `;
    setGeneratedCode(code);
  };

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h2 className="text-xl font-semibold mb-4">Data Scraper & Code Generator</h2>
      <p className="text-xs text-gray-600 mb-4">
        Note: GitHub scraping fetches public README files only, respecting GitHub's Terms of Service.
        YouTube scraping extracts public video metadata and descriptions. Use responsibly and respect platform policies.
      </p>

      <div className="mb-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to scrape"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={scrapeData}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Scrape Data
        </button>
      </div>

      {scrapedData && (
        <div className="mb-4">
          <h3 className="font-semibold">Scraped Data</h3>
          <p><strong>Title:</strong> {scrapedData.title}</p>
          <p><strong>Text Preview:</strong> {scrapedData.text.substring(0, 200)}...</p>
          <p><strong>Links:</strong> {scrapedData.links.length}</p>

          <button
            onClick={analyzeData}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Analyze & Learn
          </button>
        </div>
      )}

      {analysis && (
        <div className="mb-4">
          <h3 className="font-semibold">Analysis</h3>
          <p>Word Count: {analysis.wordCount}</p>
          <p>Top Words: {analysis.topWords.map(([word, count]) => `${word}(${count})`).join(', ')}</p>

          <button
            onClick={generateCode}
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Generate Software
          </button>
        </div>
      )}

      {generatedCode && (
        <div className="mb-4">
          <h3 className="font-semibold">Generated Code</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-64">{generatedCode}</pre>
        </div>
      )}
    </div>
  );
}