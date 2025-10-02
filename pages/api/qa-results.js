import fs from 'fs';
import path from 'path';

const QA_RESULTS_FILE = path.join(process.cwd(), 'kilo_qa_checklist_results.json');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      if (fs.existsSync(QA_RESULTS_FILE)) {
        const results = JSON.parse(fs.readFileSync(QA_RESULTS_FILE, 'utf8'));
        res.status(200).json(results);
      } else {
        // Return default structure if file doesn't exist
        const defaultResults = {
          timestamp: new Date().toISOString(),
          total_tests: 0,
          passed: 0,
          failed: 0,
          pending: 0,
          results: [],
          trends: {
            pass_rate: 0,
            recent_failures: [],
            improvement_trend: 'stable'
          }
        };
        res.status(200).json(defaultResults);
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to read QA results' });
    }
  } else if (req.method === 'POST') {
    try {
      const newResults = req.body;
      fs.writeFileSync(QA_RESULTS_FILE, JSON.stringify(newResults, null, 2));
      res.status(200).json({ message: 'QA results updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update QA results' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}