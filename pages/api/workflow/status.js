import fs from 'fs';
import path from 'path';

const STATUS_FILE = path.join(process.cwd(), 'workflow_status.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      if (fs.existsSync(STATUS_FILE)) {
        const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
        res.status(200).json(status);
      } else {
        res.status(200).json({ status: 'idle', message: 'No workflow running' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to read status' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}