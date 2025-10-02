const fs = require("fs");
const path = require("path");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const logsDir = path.join(process.cwd(), "logs");

    // Check if logs directory exists
    if (!fs.existsSync(logsDir)) {
      return res.status(200).json({ logs: [] });
    }

    // Get all .log files
    const logFiles = fs
      .readdirSync(logsDir)
      .filter((file) => file.endsWith(".log"))
      .sort((a, b) => {
        // Sort by timestamp in filename (newest first)
        const aTime = a.match(
          /zetav10_(\d{4}-\d{2}-\d{2}T\d{2}_\d{2}_\d{2}_\d{3}Z)/
        )?.[1];
        const bTime = b.match(
          /zetav10_(\d{4}-\d{2}-\d{2}T\d{2}_\d{2}_\d{2}_\d{3}Z)/
        )?.[1];
        if (aTime && bTime) {
          return bTime.localeCompare(aTime);
        }
        return b.localeCompare(a);
      });

    let allLogs = [];

    // Read the most recent log files (limit to prevent too much data)
    for (const logFile of logFiles.slice(0, 5)) {
      try {
        const filePath = path.join(logsDir, logFile);
        const content = fs.readFileSync(filePath, "utf8");

        // Parse log entries - assuming each line is a JSON log entry or plain text
        const lines = content.split("\n").filter((line) => line.trim());

        lines.forEach((line, index) => {
          try {
            // Try to parse as JSON first
            const parsed = JSON.parse(line);
            allLogs.push({
              ts:
                parsed.timestamp ||
                parsed.ts ||
                Date.now() - (lines.length - index) * 1000,
              msg: parsed.message || parsed.msg || line,
              actor: parsed.actor || parsed.agent || "system",
              level: parsed.level || "info",
            });
          } catch {
            // If not JSON, treat as plain text
            allLogs.push({
              ts: Date.now() - (lines.length - index) * 1000,
              msg: line,
              actor: "system",
              level: "info",
            });
          }
        });
      } catch (error) {
        console.error(`Error reading log file ${logFile}:`, error);
      }
    }

    // Sort all logs by timestamp (newest first) and limit to last 1000
    allLogs.sort((a, b) => (b.ts || 0) - (a.ts || 0));
    allLogs = allLogs.slice(0, 1000);

    return res.status(200).json({ logs: allLogs });
  } catch (error) {
    console.error("Logs API error:", error);
    return res.status(500).json({ error: "Failed to load logs" });
  }
}
