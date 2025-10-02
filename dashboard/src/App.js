import React from "react";
import RunList from "./RunList";
import RunDetail from "./RunDetail";

function App() {
  const [selectedRun, setSelectedRun] = React.useState(null);

  return (
    <div className="App">
      <h1>ZetaV10 Dashboard</h1>
      <RunList onSelectRun={setSelectedRun} />
      {selectedRun && <RunDetail run={selectedRun} />}
    </div>
  );
}

export default App;
