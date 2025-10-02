import React from "react";

function RunList({ onSelectRun }) {
  const runs = [
    { id: 1, name: "Run 1", status: "completed" },
    { id: 2, name: "Run 2", status: "running" },
    { id: 3, name: "Run 3", status: "failed" },
  ];

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
