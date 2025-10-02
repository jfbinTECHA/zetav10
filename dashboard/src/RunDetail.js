import React from "react";

function RunDetail({ run }) {
  return (
    <div>
      <h2>Run Detail</h2>
      <p>ID: {run.id}</p>
      <p>Name: {run.name}</p>
      <p>Status: {run.status}</p>
    </div>
  );
}

export default RunDetail;
