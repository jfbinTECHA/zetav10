import { useLogs } from "./LogsContext";

export default function LogsPanel() {
  const { logs, addLog } = useLogs();

  return (
    <div className="bg-gray-900 text-green-300 rounded-xl p-4 mt-6 font-mono text-sm">
      <h2 className="text-lg font-semibold text-white mb-2">📜 Live Logs</h2>
      <div className="h-40 overflow-y-auto border border-gray-700 rounded p-2 bg-black">
        {logs.map((log, idx) => (
          <p key={idx}>{log.timestamp.toLocaleTimeString()} - {log.message}{log.priority ? ` [${log.priority}]` : ''}</p>
        ))}
      </div>
      <button
        onClick={() => addLog("Manual log entry added.")}
        className="mt-3 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        ➕ Add Log
      </button>
    </div>
  );
}