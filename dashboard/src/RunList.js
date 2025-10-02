import React, { useState, useEffect } from "react";
import RunDetail from "./RunDetail";

function RunList() {
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);

  useEffect(() => {
    // Mock runs for testing - in production, read from ../logs/
    const mockRuns = [
      {
        file: "zetav10_2025-10-02T18_27_04_914Z.log",
        status: "Success",
        content: "ZetaV10 Workflow Run - 2025-10-02T18_27_04_914Z\n\n=== Backup components/AgentCard.js ===\n$ cp components/AgentCard.js backup/2025-10-02T18_27_04_914Z/\n(Dry-run) Command skipped.\n\n✅ ZetaV10 workflow completed successfully!"
      },
      {
        file: "zetav10_2025-10-02T18_18_33_399Z.log",
        status: "Failure",
        content: "ZetaV10 Workflow Run - 2025-10-02T18_18_33_399Z\n\n=== Linting ===\n$ npm run lint\n✖ 1 problem (0 errors, 1 warning)\n\n⚠️ FAILURE: Linting failed.\nRollback applied."
      }
    ];
    setRuns(mockRuns);
  }, []);

  return (
    <div>
      <h2>ZetaV10 Update Runs</h2>
      <ul>
        {runs.map(run => (
          <li key={run.file} onClick={() => setSelectedRun(run)} style={{cursor: 'pointer', margin: '5px 0'}}>
            {run.file} - {run.status}
          </li>
        ))}
      </ul>
      {selectedRun && <RunDetail run={selectedRun} />}
    </div>
  );
}

export default RunList;