import { useEffect, useState } from "react";
import { useLogs } from "./LogsContext";

export default function MissionControl({ agentStatuses, filters, setFilters }) {
  const { logs } = useLogs();
  const [activeTasks, setActiveTasks] = useState([]);

  const agentColors = {
    Chrono: "bg-green-100 text-green-800 border-green-300",
    Vega: "bg-purple-100 text-purple-800 border-purple-300",
    Aria: "bg-blue-100 text-blue-800 border-blue-300",
    "Kilo Code": "bg-orange-100 text-orange-800 border-orange-300",
    Default: "bg-gray-100 text-gray-800 border-gray-300",
  };

  useEffect(() => {
    let filtered = logs
      .slice(-50)
      .filter((log) => log.message.includes("task") || log.message.includes("active"))
      .map((log) => ({
        agent: log.agent || "Unknown",
        message: log.message,
        priority: log.priority || "low",
        time: log.timestamp.toLocaleTimeString(),
      }));

    if (filters.agent !== "all") filtered = filtered.filter((log) => log.agent === filters.agent);
    if (filters.priority !== "all") filtered = filtered.filter((log) => log.priority === filters.priority);
    if (filters.searchTerm.trim() !== "")
      filtered = filtered.filter((log) => log.message.toLowerCase().includes(filters.searchTerm.toLowerCase()));

    setActiveTasks(filtered.reverse());
  }, [logs, filters]);

  const activeCount = Object.values(agentStatuses).filter((s) => s === "active").length;
  const idleCount = Object.values(agentStatuses).filter((s) => s === "idle").length;

  return (
    <div className="bg-indigo-50 border border-indigo-300 rounded-2xl p-4 shadow-md">
      <h2 className="text-lg font-bold text-indigo-800 mb-2">🛰 Mission Control</h2>

      {/* Status Summary */}
      <div className="flex gap-4 mb-3 text-sm font-medium">
        <span className="px-2 py-1 rounded bg-green-100 text-green-800 border border-green-300">
          ✅ Active Agents: {activeCount}
        </span>
        <span className="px-2 py-1 rounded bg-red-100 text-red-800 border border-red-300">
          ⏸ Idle Agents: {idleCount}
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3 text-sm">
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="px-2 py-1 border rounded"
        >
          <option value="all">All Priorities</option>
          <option value="high">High ⚡</option>
          <option value="medium">Medium 🛠</option>
          <option value="low">Low 💤</option>
        </select>

        <select
          value={filters.agent}
          onChange={(e) => setFilters({ ...filters, agent: e.target.value })}
          className="px-2 py-1 border rounded"
        >
          <option value="all">All Agents</option>
          <option value="Chrono">Chrono</option>
          <option value="Vega">Vega</option>
          <option value="Aria">Aria</option>
          <option value="Kilo Code">Kilo Code</option>
        </select>

        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.searchTerm}
          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          className="px-2 py-1 border rounded flex-1"
        />
      </div>

      {/* Task List */}
      <div className="h-40 overflow-y-auto bg-white border rounded-lg p-2">
        {activeTasks.length > 0 ? (
          activeTasks.map((task, idx) => {
            const colorClass = agentColors[task.agent] || agentColors.Default;
            const priorityColor =
              task.priority === "high"
                ? "bg-red-200 text-red-800"
                : task.priority === "medium"
                ? "bg-orange-200 text-orange-800"
                : "bg-gray-200 text-gray-700";

            return (
              <div
                key={idx}
                className="text-xs font-mono p-1 border-b last:border-0 flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${colorClass}`}>
                    {task.agent}
                  </span>
                  <span className={`px-1 rounded text-[10px] font-bold ${priorityColor}`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <span className="text-indigo-700">{task.message}</span>
                </div>
                <span className="text-gray-500">{task.time}</span>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 text-xs">No tasks match current filters.</p>
        )}
      </div>
    </div>
  );
}