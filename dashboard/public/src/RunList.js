import React, { useState, useEffect } from "react";

function RunList({ onSelectRun }) {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    // Fetch logs from ../logs/
    fetch("../logs/")
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const links = Array.from(doc.querySelectorAll("a"))
          .filter((a) => a.href.includes(".log"))
          .map((a) => a.textContent.replace(".log", ""));

        const runData = links.map((name, index) => ({
          id: index + 1,
          name: name,
          status: "completed", // Assume completed if log exists
          logFile: name + ".log",
        }));

        setRuns(runData);
      })
      .catch((err) => console.error("Failed to load logs:", err));
  }, []);

  return (
    <div>
      <h2>Run List</h2>
      <ul>
        {runs.map((run) => (
          <li key={run.id} onClick={() => onSelectRun(run)}>
            {run.name} - {run.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RunList;
