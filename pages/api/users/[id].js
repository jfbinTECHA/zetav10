import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'users.json');

export default async function handler(req, res) {
  const { id } = req.query;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.method === 'GET') {
      res.status(200).json(users[userIndex]);
    } else if (req.method === 'PUT') {
      const updatedUser = { ...users[userIndex], ...req.body };

      // Basic validation
      if (!updatedUser.username || !updatedUser.email || !updatedUser.role) {
        return res.status(400).json({ error: 'Username, email, and role are required' });
      }

      // Check for duplicate username/email (excluding current user)
      const duplicate = users.find(u =>
        u.id !== userId &&
        (u.username === updatedUser.username || u.email === updatedUser.email)
      );
      if (duplicate) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      users[userIndex] = updatedUser;
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      res.status(200).json(updatedUser);
    } else if (req.method === 'DELETE') {
      users.splice(userIndex, 1);
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}