import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useLogs } from "./LogsContext";

const highPrioritySound = new Audio("/alert.mp3");
highPrioritySound.volume = 0.5; // 50% volume
highPrioritySound.loop = false;  // play once

export default function AgentCard({ name, role, onStatusChange, filters, highlightOnly, panicMode }) {
  const [status, setStatus] = useState("idle");
  const [expanded, setExpanded] = useState(false);
  const { addLog, agentLogs, acknowledgeLog } = useLogs();

  const panicFlash = panicMode && agentLogs[name]?.some(log => log.priority === "high");

  const acknowledgeTask = (idx) => {
    acknowledgeLog(name, idx);
  };

  // Notify parent about status change
  useEffect(() => {
    if (onStatusChange) onStatusChange(name, status);
  }, [status, name, onStatusChange]);

  // 🎲 Task pools for each agent
  const taskPool = {
    Chrono: [
      { message: "Analyzed patient dataset and flagged anomalies.", priority: "high" },
      { message: "Cross-checked health records with predictive models.", priority: "medium" },
      { message: "Suggested early interventions for at-risk cases.", priority: "high" },
      { message: "Updated time-series medical trends.", priority: "low" }
    ],
    Vega: [
      { message: "Optimized UX layout for higher engagement.", priority: "medium" },
      { message: "Redesigned button placements for clarity.", priority: "medium" },
      { message: "Improved accessibility compliance (WCAG).", priority: "high" },
      { message: "Tested user flows for friction points.", priority: "low" }
    ],
    Aria: [
      { message: "Searched academic databases for relevant sources.", priority: "medium" },
      { message: "Summarized three new papers on AI ethics.", priority: "high" },
      { message: "Organized citations for ongoing research.", priority: "low" },
      { message: "Flagged outdated sources for review.", priority: "medium" }
    ],
    "Kilo Code": [
      { message: "Deployed new AI function and validated results.", priority: "high" },
      { message: "Fixed bug in task routing logic.", priority: "high" },
      { message: "Refactored API calls for efficiency.", priority: "medium" },
      { message: "Ran automated test suite successfully.", priority: "low" }
    ],
    Default: [
      { message: "Performed routine system check.", priority: "low" },
      { message: "Optimized resource allocation.", priority: "medium" },
      { message: "Verified network stability.", priority: "medium" },
      { message: "Ran background maintenance tasks.", priority: "low" }
    ]
  };

  // 🎯 Auto-activity effect
  useEffect(() => {
    if (status !== "active") return;

    const randomDelay = () => Math.floor(Math.random() * 5000) + 3000;
    let timeoutId;

    const generateTask = () => {
      const tasks = taskPool[name] || taskPool.Default;
      const task = tasks[Math.floor(Math.random() * tasks.length)];
      addLog({
        message: task.message,
        priority: task.priority,
        acknowledged: false
      }, name);

      // 🚨 Toast notification
      if (task.priority === "high") {
        toast.error(`${name}: ${task.message}`, { duration: 5000 });
        // 🔊 Play sound alert
        highPrioritySound.play().catch((err) => console.log("Sound play error:", err));
      }

      timeoutId = setTimeout(generateTask, randomDelay());
    };

    timeoutId = setTimeout(generateTask, randomDelay());
    return () => clearTimeout(timeoutId);
  }, [status, name, addLog]);

  const toggleStatus = () => {
    const newStatus = status === "active" ? "idle" : "active";
    setStatus(newStatus);
    addLog(`${name} is now ${newStatus}.`, name);
  };

  const assignTask = () => {
    setStatus("active");
    addLog(`${name} was assigned a new task.`, name);
  };

  return (
    <div className={`bg-white shadow rounded-xl p-4 hover:shadow-lg transition ${panicFlash ? "animate-pulse border-red-500 border-2" : ""}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* 🔴/🟢 Status Dot */}
          <span
            className={`h-3 w-3 rounded-full ${
              status === "active" ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <div>
            <h2 className="text-xl font-semibold">{name}</h2>
            <p className="text-gray-600">{role}</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          {expanded ? "Collapse" : "Details"}
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={toggleStatus}
          className="px-3 py-1 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600"
        >
          {status === "active" ? "Stop" : "Start"}
        </button>
        <button
          onClick={assignTask}
          className="px-3 py-1 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600"
        >
          Assign Task
        </button>
      </div>

      {expanded && (
        <div className="mt-4 bg-gray-50 border rounded-lg p-3">
          <h3 className="font-semibold mb-2">📊 Agent Details</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            <li><strong>Role:</strong> {role}</li>
            <li><strong>Status:</strong> {status}</li>
            <li><strong>Performance:</strong> {status === "active" ? "98% efficiency" : "Idle"}</li>
            <li><strong>Errors:</strong> {status === "active" ? "None detected" : "N/A"}</li>
          </ul>

          <h4 className="font-semibold mt-3">📜 Task History</h4>
          <div className="h-24 overflow-y-auto bg-white border rounded p-2 text-xs font-mono">
            {(agentLogs[name] || []).length > 0 ? (
              (agentLogs[name] || [])
                .filter((log) =>
                  highlightOnly
                    ? (filters.priority === "all" || log.priority === filters.priority) &&
                      (filters.agent === "all" || filters.agent === name)
                    : true
                )
                .map((log, idx) => {
                  const matchesFilter =
                    (filters.priority === "all" || log.priority === filters.priority) &&
                    (filters.agent === "all" || filters.agent === name);

                  const priorityColor =
                    log.priority === "high"
                      ? "bg-red-200 text-red-800"
                      : log.priority === "medium"
                      ? "bg-orange-200 text-orange-800"
                      : "bg-gray-200 text-gray-700";

                  return (
                    <div
                      key={idx}
                      className={`flex justify-between items-center mb-1 p-1 rounded transition
                        ${panicMode && log.priority === "high" && !log.acknowledged ? "animate-pulse bg-red-100" : ""}
                        ${log.acknowledged ? "opacity-50 line-through" : ""}
                      `}
                    >
                      <span className={`px-1 rounded text-[10px] font-bold ${
                        log.priority === "high"
                          ? "bg-red-200 text-red-800"
                          : log.priority === "medium"
                          ? "bg-orange-200 text-orange-800"
                          : "bg-gray-200 text-gray-700"
                      }`}>
                        {log.priority.toUpperCase()}
                      </span>
                      <span className="flex-1 ml-1">{log.message}</span>
                      {log.priority === "high" && !log.acknowledged && (
                        <button
                          onClick={() => acknowledgeTask(idx)}
                          className="ml-2 px-2 py-0.5 text-[10px] bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          ✅ Acknowledge
                        </button>
                      )}
                    </div>
                  );
                })
            ) : (
              <p className="text-gray-400">No logs yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}