import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const STATUS_FILE = path.join(process.cwd(), 'workflow_status.json');
const SCRIPT_PATH = path.join(process.cwd(), 'resume_workflow.sh');

function updateStatus(status, pid = null, message = '') {
  const statusData = { status, pid, message, timestamp: new Date().toISOString() };
  fs.writeFileSync(STATUS_FILE, JSON.stringify(statusData, null, 2));
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { action } = req.body;

    if (action === 'start') {
      try {
        // Check if already running
        if (fs.existsSync(STATUS_FILE)) {
          const currentStatus = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
          if (currentStatus.status === 'running') {
            return res.status(400).json({ error: 'Workflow already running' });
          }
        }

        // Start the workflow
        const child = spawn('bash', [SCRIPT_PATH], {
          cwd: process.cwd(),
          detached: true,
          stdio: 'ignore'
        });

        child.unref();

        updateStatus('running', child.pid, 'Workflow started');

        res.status(200).json({ message: 'Workflow started', pid: child.pid });
      } catch (error) {
        updateStatus('failed', null, error.message);
        res.status(500).json({ error: 'Failed to start workflow' });
      }
    } else if (action === 'stop') {
      try {
        if (fs.existsSync(STATUS_FILE)) {
          const currentStatus = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
          if (currentStatus.status === 'running' && currentStatus.pid) {
            process.kill(currentStatus.pid, 'SIGTERM');
            updateStatus('stopped', null, 'Workflow stopped manually');
            return res.status(200).json({ message: 'Workflow stopped' });
          }
        }
        res.status(400).json({ error: 'No running workflow to stop' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to stop workflow' });
      }
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}