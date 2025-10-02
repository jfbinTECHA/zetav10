import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const API_KEYS_FILE = path.join(process.cwd(), 'api-keys.json');

// Initialize API keys file if it doesn't exist
if (!fs.existsSync(API_KEYS_FILE)) {
  const defaultKeys = {
    keys: [],
    created: new Date().toISOString()
  };
  fs.writeFileSync(API_KEYS_FILE, JSON.stringify(defaultKeys, null, 2));
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // List API keys (basic info only, not the actual keys)
    try {
      const data = JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));
      const keys = data.keys.map(key => ({
        id: key.id,
        name: key.name,
        created: key.created,
        lastUsed: key.lastUsed,
        permissions: key.permissions
      }));
      res.status(200).json({ keys });
    } catch (error) {
      res.status(500).json({ error: 'Failed to read API keys' });
    }
  } else if (req.method === 'POST') {
    // Generate new API key
    try {
      const { name, permissions = ['read'], customKey, envVar } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const data = JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));

      // Use custom key if provided, otherwise generate one
      const keyValue = customKey && customKey.trim() ? customKey.trim() : crypto.randomBytes(32).toString('hex');

      const newKey = {
        id: crypto.randomUUID(),
        key: keyValue,
        name,
        permissions,
        envVar: envVar || null,
        created: new Date().toISOString(),
        lastUsed: null
      };

      data.keys.push(newKey);
      fs.writeFileSync(API_KEYS_FILE, JSON.stringify(data, null, 2));

      res.status(201).json({
        id: newKey.id,
        key: newKey.key,
        name: newKey.name,
        permissions: newKey.permissions,
        envVar: newKey.envVar,
        created: newKey.created
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create API key' });
    }
  } else if (req.method === 'DELETE') {
    // Delete API key
    try {
      const { id } = req.query;
      const data = JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));
      data.keys = data.keys.filter(key => key.id !== id);
      fs.writeFileSync(API_KEYS_FILE, JSON.stringify(data, null, 2));
      res.status(200).json({ message: 'API key deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete API key' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}