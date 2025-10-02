import React from 'react';
import { exec } from 'child_process';

export default function RunDetail({ run }) {

  const rerunFailed = () => {
    if(run.status !== 'Failure'){
      alert('Only failed runs can be re-run');
      return;
    }

    // Execute the runner script for the failed update
    exec('node ../run_workflow.js', (error, stdout, stderr) => {
      if(error){
        alert('Error running workflow: ' + error.message);
        return;
      }
      if(stderr){
        console.error(stderr);
      }
      alert('Re-run triggered. Check logs folder for updates.');
    });
  };

  return (
    <div style={{border:'1px solid #ccc', padding:'10px', marginTop:'10px'}}>
      <h3>{run.file} - {run.status}</h3>
      <pre style={{whiteSpace:'pre-wrap'}}>{run.content}</pre>
      {run.status === 'Failure' && (
        <button
          onClick={rerunFailed}
          style={{
            marginTop:'10px',
            padding:'5px 10px',
            background:'#ff5555',
            color:'#fff',
            border:'none',
            borderRadius:'5px',
            cursor: 'pointer'
          }}
        >
          Re-run Failed Update
        </button>
      )}
    </div>
  );
}
