import fs from 'fs';
import path from 'path';

const API_KEYS_FILE = path.join(process.cwd(), 'api-keys.json');

export function authenticateRequest(req) {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'] || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);

  if (!apiKey) {
    return { authenticated: false, error: 'API key required' };
  }

  try {
    if (!fs.existsSync(API_KEYS_FILE)) {
      return { authenticated: false, error: 'API key system not initialized' };
    }

    const data = JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));
    const keyRecord = data.keys.find(k => k.key === apiKey);

    if (!keyRecord) {
      return { authenticated: false, error: 'Invalid API key' };
    }

    // Update last used timestamp
    keyRecord.lastUsed = new Date().toISOString();
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(data, null, 2));

    return {
      authenticated: true,
      keyRecord: {
        id: keyRecord.id,
        name: keyRecord.name,
        permissions: keyRecord.permissions
      }
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { authenticated: false, error: 'Authentication system error' };
  }
}

export function requireAuth(handler, requiredPermissions = ['read']) {
  return async (req, res) => {
    const auth = authenticateRequest(req);

    if (!auth.authenticated) {
      return res.status(401).json({
        error: auth.error,
        message: 'Access denied. Please provide a valid API key.'
      });
    }

    // Check permissions
    const hasPermission = requiredPermissions.every(perm =>
      auth.keyRecord.permissions.includes(perm)
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Required permissions: ${requiredPermissions.join(', ')}`
      });
    }

    // Add auth info to request
    req.auth = auth.keyRecord;

    return handler(req, res);
  };
}