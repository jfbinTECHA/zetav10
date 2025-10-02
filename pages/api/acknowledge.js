export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { agentId } = req.body;

  if (!agentId) {
    return res.status(400).json({ error: "agentId is required" });
  }

  // In a real system, this would update the agent's status in a database
  // For now, just acknowledge the request
  console.log(`Acknowledged agent: ${agentId}`);

  return res.status(200).json({
    success: true,
    message: `Agent ${agentId} acknowledged`,
    timestamp: new Date().toISOString(),
  });
}
