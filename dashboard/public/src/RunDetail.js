import React, { useState, useEffect } from "react";

export default function RunDetail({ run }) {
  const [content, setContent] = useState("Loading...");

  useEffect(() => {
    if (run && run.logFile) {
      fetch(`../logs/${run.logFile}`)
        .then((response) => response.text())
        .then((text) => setContent(text))
        .catch((err) => setContent("Failed to load log: " + err.message));
    }
  }, [run]);

  const rerunFailed = () => {
    if (run.status !== "Failure") {
      alert("Only failed runs can be re-run");
      return;
    }

    // Execute the runner script for the failed update
    // Note: In browser, we can't exec node, so this is placeholder
    alert(
      "Re-run not supported in browser. Run 'node ../run_workflow.js' manually."
    );
  };

  if (!run) return null;

  return (
    <div
      style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}
    >
      <h3>
        {run.name} - {run.status}
      </h3>
      <pre style={{ whiteSpace: "pre-wrap" }}>{content}</pre>
      {run.status === "Failure" && (
        <button
          onClick={rerunFailed}
          style={{
            marginTop: "10px",
            padding: "5px 10px",
            background: "#ff5555",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Re-run Failed Update
        </button>
      )}
    </div>
  );
}
