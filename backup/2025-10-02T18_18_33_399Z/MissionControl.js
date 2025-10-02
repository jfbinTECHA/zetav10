import React, { useEffect, useState, useRef, useCallback } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import AgentCard from "./AgentCard";
import toast from "react-hot-toast";

const LogsPanel = dynamic(() => import("./LogsPanel"), { ssr: false });
const fetcher = (...args) =>
  fetch(...args).then((res) => {
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
  });

export default function MissionControl({ apiBase = "/api" }) {
  const { data, error, mutate } = useSWR(`${apiBase}/agents`, fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });
  const [panicMode, setPanicMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/alert.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }
  }, []);

  const togglePanic = useCallback(
    async (value) => {
      setPanicMode(Boolean(value));
      if (value && soundEnabled) {
        try {
          await audioRef.current?.play();
        } catch (err) {
          toast("Audio blocked — using visual alerts only");
        }
      } else {
        audioRef.current?.pause();
        audioRef.current?.currentTime && (audioRef.current.currentTime = 0);
      }
    },
    [soundEnabled]
  );

  if (error)
    return (
      <div className="p-4">Failed to load agents: {String(error.message)}</div>
    );
  const agents = Array.isArray(data?.agents) ? data.agents : [];

  const handleAcknowledge = async (agent) => {
    try {
      await fetch(`${apiBase}/acknowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id || agent.name }),
      });
      toast.success(`Acknowledged ${agent.name || "agent"}`);
      mutate();
    } catch (err) {
      toast.error("Failed to acknowledge");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mission Control</h2>
        <div className="flex items-center gap-3">
          {!soundEnabled && (
            <button
              onClick={() => setSoundEnabled(true)}
              className="px-3 py-1 rounded bg-gray-800 text-white"
            >
              Enable Sounds (click to allow)
            </button>
          )}
          <button
            onClick={() => togglePanic(!panicMode)}
            aria-pressed={panicMode}
            className={`px-3 py-1 rounded ${
              panicMode ? "bg-red-600 text-white" : "bg-gray-200"
            }`}
          >
            {panicMode ? "Disable Panic" : "Enable Panic"}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.length === 0 && (
          <div className="text-gray-500">No agents found</div>
        )}
        {agents.map((agent) => (
          <AgentCard
            key={agent.id || agent.name}
            agent={agent}
            onAcknowledge={handleAcknowledge}
          />
        ))}
      </div>
      <div>
        <LogsPanel apiBase={apiBase} panicMode={panicMode} />
      </div>
    </section>
  );
}
