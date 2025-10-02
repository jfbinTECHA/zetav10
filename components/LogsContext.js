import { createContext, useContext, useState } from "react";

const LogsContext = createContext();

export function LogsProvider({ children }) {
  const [logs, setLogs] = useState([
    {
      timestamp: new Date(),
      message: "System initialized.",
      priority: null,
      agent: null,
    },
    {
      timestamp: new Date(),
      message: "Chrono loaded medical dataset.",
      priority: null,
      agent: "Chrono",
    },
    {
      timestamp: new Date(),
      message: "Vega optimized UX dashboard.",
      priority: null,
      agent: "Vega",
    },
  ]);

  const [agentLogs, setAgentLogs] = useState({});

  const addLog = (msg, agent = null) => {
    const message = typeof msg === "object" ? msg.message : msg;
    const priority = typeof msg === "object" ? msg.priority : null;
    const logEntry = {
      timestamp: new Date(),
      message,
      priority,
      agent,
      acknowledged: msg.acknowledged || false,
    };
    setLogs((prev) => [...prev, logEntry]);

    if (agent) {
      setAgentLogs((prev) => ({
        ...prev,
        [agent]: [...(prev[agent] || []), logEntry],
      }));
    }
  };

  const acknowledgeLog = (agent, idx) => {
    setAgentLogs((prev) => {
      const updated = { ...prev };
      if (updated[agent] && updated[agent][idx]) {
        updated[agent][idx].acknowledged = true;
      }
      return updated;
    });
  };

  return (
    <LogsContext.Provider value={{ logs, agentLogs, addLog, acknowledgeLog }}>
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  return useContext(LogsContext);
}
