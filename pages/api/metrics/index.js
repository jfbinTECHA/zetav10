export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Mock real-time metrics data
    const metrics = {
      system: {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        uptime: Math.floor(Math.random() * 86400) // seconds
      },
      workflows: {
        total: 45,
        running: Math.floor(Math.random() * 5),
        completed: 38,
        failed: 2,
        success_rate: 94.7
      },
      users: {
        total: 12,
        active: 8,
        new_today: Math.floor(Math.random() * 3)
      },
      api: {
        requests_today: Math.floor(Math.random() * 1000) + 500,
        avg_response_time: Math.random() * 200 + 50,
        error_rate: Math.random() * 5
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json(metrics);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}