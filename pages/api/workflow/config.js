import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'workflow_config.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        res.status(200).json(config);
      } else {
        res.status(404).json({ error: 'Configuration file not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to read configuration' });
    }
  } else if (req.method === 'PUT') {
    try {
      const newConfig = req.body;
      // Basic validation
      if (!newConfig.dry_run || !newConfig.files_to_update) {
        return res.status(400).json({ error: 'Invalid configuration' });
      }

      fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
      res.status(200).json({ message: 'Configuration updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}