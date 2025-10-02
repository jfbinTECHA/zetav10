import fs from 'fs';
import path from 'path';

const LOGS_DIR = path.join(process.cwd(), 'logs');

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      if (fs.existsSync(LOGS_DIR)) {
        const logFiles = fs.readdirSync(LOGS_DIR)
          .filter(file => file.startsWith('zetav10_'))
          .sort()
          .reverse();

        if (logFiles.length > 0) {
          const latestLog = path.join(LOGS_DIR, logFiles[0]);
          const logContent = fs.readFileSync(latestLog, 'utf8');
          res.status(200).json({
            filename: logFiles[0],
            content: logContent,
            lines: logContent.split('\n').length
          });
        } else {
          res.status(200).json({ message: 'No logs found' });
        }
      } else {
        res.status(200).json({ message: 'Logs directory not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to read logs' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}