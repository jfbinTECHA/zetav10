export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Mock agents data - in a real system this would come from a database or external service
  const agents = [
    {
      id: "agent-1",
      name: "Code Assistant",
      status: "active",
      lastActivity: new Date().toISOString(),
      tasksCompleted: 42,
      tasks: [
        {
          message: "Optimizing React components",
          priority: "high",
          source: "system",
          details:
            "Analyzing component tree, identifying performance bottlenecks, applying memoization",
        },
      ],
      health: "good",
    },
    {
      id: "agent-2",
      name: "Data Scraper",
      status: "active",
      lastActivity: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      tasksCompleted: 28,
      tasks: [
        {
          message: "Scraping web data from APIs",
          priority: "medium",
          source: "scheduler",
          details:
            "Connecting to data sources, parsing JSON responses, validating data integrity",
        },
      ],
      health: "good",
    },
    {
      id: "agent-3",
      name: "Learning Agent",
      status: "active",
      lastActivity: new Date().toISOString(),
      tasksCompleted: 15,
      tasks: [
        {
          message: "Training on new datasets",
          priority: "high",
          source: "learning",
          details:
            "Loading training data, preprocessing features, running neural network training epochs",
        },
      ],
      health: "good",
    },
  ];

  return res.status(200).json({ agents });
}
