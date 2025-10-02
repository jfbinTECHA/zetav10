import fs from 'fs';
import path from 'path';
import { requireAuth } from '../../utils/auth.js';

const QA_RESULTS_FILE = path.join(process.cwd(), 'kilo_qa_checklist_results.json');
const QA_HISTORY_FILE = path.join(process.cwd(), 'kilo_qa_history.json');

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let current = [];
      let historical = {};

      // Load current QA results
      if (fs.existsSync(QA_RESULTS_FILE)) {
        current = JSON.parse(fs.readFileSync(QA_RESULTS_FILE, 'utf8'));
      }

      // Load historical QA data
      if (fs.existsSync(QA_HISTORY_FILE)) {
        historical = JSON.parse(fs.readFileSync(QA_HISTORY_FILE, 'utf8'));
      }

      const response = {
        current: current,
        historical: historical,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error reading QA data:', error);
      res.status(500).json({ error: 'Failed to read QA data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default requireAuth(handler);