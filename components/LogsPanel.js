import React, { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { FixedSizeList as List } from "react-window"; // virtualized list (add to deps)
import DOMPurify from "dompurify"; // sanitize if you ever use innerHTML

// Simple fetcher for logs
async function fetchLogs(apiBase) {
  const res = await fetch(`${apiBase}/logs`);
  if (!res.ok) throw new Error("Failed to load logs");
  return res.json();
}

function LogRow({ index, style, data }) {
  const log = data[index] || {};
  const time = new Date(log.ts || Date.now()).toLocaleTimeString();
  // sanitize any log message if rendering as HTML (we render plain text)
  const message = String(log.msg || log.message || "").slice(0, 1000);
  return (
    <div style={style} className="px-2 py-1 border-b border-gray-100 text-sm">
      <div className="text-xs text-gray-400">
        {time} • {log.actor || "agent"}
      </div>
      <div className="whitespace-pre-wrap break-words">{message}</div>
    </div>
  );
}

export default function LogsPanel({ apiBase = "/api", panicMode = false }) {
  const [logs, setLogs] = useState([]);
  const pollingRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const json = await fetchLogs(apiBase);
      // Expecting json.logs array
      setLogs(Array.isArray(json.logs) ? json.logs.slice(-1000) : []);
    } catch (err) {
      console.error("Logs fetch error", err);
    }
  }, [apiBase]);

  useEffect(() => {
    load();
    // Poll every 5 seconds but pause if panicMode is true (or you might want to increase)
    pollingRef.current = setInterval(load, 5000);
    return () => clearInterval(pollingRef.current);
  }, [load]);

  // If you want to highlight during panic, you can map over logs and set a CSS class or banner.
  return (
    <div className="mt-4 rounded border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Recent Logs</h3>
        <div className="text-xs text-gray-500">{logs.length} entries</div>
      </div>

      <div style={{ height: 300 }}>
        <List
          itemCount={logs.length}
          itemSize={68}
          width="100%"
          itemData={logs}
        >
          {LogRow}
        </List>
      </div>
    </div>
  );
}

LogsPanel.propTypes = {
  apiBase: PropTypes.string,
  panicMode: PropTypes.bool,
};
