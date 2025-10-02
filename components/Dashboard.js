import { useState } from "react";
import { Toaster } from "react-hot-toast";
import MissionControl from "./MissionControl";
import AgentCard from "./AgentCard";
import DataScraper from "./DataScraper";
import AICodeChat from "./AICodeChat";

export default function Dashboard() {
  const [agentStatuses, setAgentStatuses] = useState({
    Chrono: "idle",
    Vega: "idle",
    Aria: "idle",
    "Kilo Code": "idle",
  });

  const [filters, setFilters] = useState({ priority: "all", agent: "all", searchTerm: "" });
  const [highlightOnly, setHighlightOnly] = useState(false);
  const [panicMode, setPanicMode] = useState(false);

  const agents = [
    { name: "Chrono", role: "Medical Informatics" },
    { name: "Vega", role: "UX & Engagement" },
    { name: "Aria", role: "Research & Data Discovery" },
    { name: "Kilo Code", role: "AI Developer" },
  ];

  // function to update status when agents change
  const handleStatusChange = (name, status) => {
    setAgentStatuses((prev) => ({ ...prev, [name]: status }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster position="top-right" reverseOrder={false} />

      <h1 className="text-3xl font-bold text-center mb-6">🤖 Zeta AI Dashboard</h1>

      {/* Mission Control */}
      <MissionControl
        agentStatuses={agentStatuses}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Highlight Only Toggle */}
      <div className="flex items-center gap-2 mt-4 mb-4">
        <input
          type="checkbox"
          id="highlightOnly"
          checked={highlightOnly}
          onChange={(e) => setHighlightOnly(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="highlightOnly" className="text-sm">
          Show Only Matching Tasks
        </label>
      </div>

      {/* Panic Mode Toggle */}
      <div className="flex justify-center my-4">
        <button
          onClick={() => setPanicMode(!panicMode)}
          className={`px-4 py-2 rounded-lg text-white font-bold ${
            panicMode ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          {panicMode ? "Disable Panic Mode" : "Enable Panic Mode"}
        </button>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {agents.map((agent) => (
          <AgentCard
            key={agent.name}
            name={agent.name}
            role={agent.role}
            onStatusChange={handleStatusChange}
            filters={filters}
            highlightOnly={highlightOnly}
            panicMode={panicMode}
          />
        ))}
      </div>

      {/* Data Scraper */}
      <div className="mt-8">
        <DataScraper />
      </div>

      {/* AI Code Chat */}
      <div className="mt-8">
        <AICodeChat />
      </div>
    </div>
  );
}