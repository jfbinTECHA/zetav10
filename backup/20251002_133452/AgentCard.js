import React, { useMemo } from "react";
import PropTypes from "prop-types";

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

function AgentCard({ agent = {}, onAcknowledge = () => {} }) {
  const { name = "Unknown", status = "idle", tasks = [] } = agent;
  const highPriorityCount = useMemo(
    () =>
      tasks.filter((t) => String(t.priority).toLowerCase() === "high").length,
    [tasks]
  );
  return (
    <div className="rounded-lg p-3 shadow-sm border border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{name}</div>
          <div className="text-sm text-gray-500">Status: {status}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">High-priority</div>
          <div className="mt-1 inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100">
            <span className="text-sm font-medium">{highPriorityCount}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {tasks.slice(0, 4).map((t, idx) => {
          const priority = String(t.priority || "low").toLowerCase();
          const badge = priorityColors[priority] || priorityColors.low;
          const safeMsg = String(t.message || "").slice(0, 200);
          return (
            <div key={idx} className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium">{safeMsg}</div>
                <div className="text-xs text-gray-400">
                  {t.source || "agent"}
                </div>
              </div>
              <div className={`ml-3 px-2 py-0.5 rounded-full text-xs ${badge}`}>
                {priority}
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && (
          <div className="text-sm text-gray-400">No active tasks</div>
        )}
        <div className="flex justify-end">
          <button
            onClick={() => onAcknowledge(agent)}
            className="text-sm px-3 py-1 rounded bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
            aria-label={`Acknowledge tasks for ${name}`}
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}

AgentCard.propTypes = {
  agent: PropTypes.shape({
    name: PropTypes.string,
    status: PropTypes.string,
    tasks: PropTypes.arrayOf(
      PropTypes.shape({
        message: PropTypes.string,
        priority: PropTypes.string,
        source: PropTypes.string,
      })
    ),
  }),
  onAcknowledge: PropTypes.func,
};
export default React.memo(AgentCard);
