import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'users.json');

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  const defaultUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@zeta-ai.com',
      role: 'Admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: null
    }
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read users' });
    }
  } else if (req.method === 'POST') {
    try {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...req.body,
        status: req.body.status || 'active',
        createdAt: new Date().toISOString(),
        lastLogin: null
      };

      // Basic validation
      if (!newUser.username || !newUser.email || !newUser.role) {
        return res.status(400).json({ error: 'Username, email, and role are required' });
      }

      // Check for duplicate username/email
      if (users.find(u => u.username === newUser.username || u.email === newUser.email)) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      users.push(newUser);
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}