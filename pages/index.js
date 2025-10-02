import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import MissionControl from "../components/MissionControl";
import APIPluginDashboard from "../components/APIPluginDashboard";
import WorkflowDashboard from "../components/WorkflowDashboard";
import UserManagement from "../components/UserManagement";
import DataVisualization from "../components/DataVisualization";
import QADashboard from "../components/QADashboard";
import APIKeyManagement from "../components/APIKeyManagement";
import { Toaster } from "react-hot-toast";

const Page = () => {
  return (
    <>
      <Head>
        <title>Zeta AI Dashboard</title>
        <meta
          name="description"
          content="Real-time agent monitoring dashboard"
        />
      </Head>
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold">Zeta AI Dashboard</h1>
            <p className="text-sm text-gray-500">
              Mission control & agent monitoring
            </p>
            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
              <a
                href="/qa-dashboard-realtime.html"
                target="_blank"
                style={{
                  backgroundColor: '#FF5722',
                  color: 'white',
                  padding: '10px 15px',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                ⚡ Real-Time QA Dashboard (Polling)
              </a>
              <a
                href="/qa-dashboard.html"
                target="_blank"
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '10px 15px',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                📊 QA Dashboard (Aggregated)
              </a>
              <a
                href="/qa-dashboard-granular.html"
                target="_blank"
                style={{
                  backgroundColor: '#2196F3',
                  color: 'white',
                  padding: '10px 15px',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                📈 QA Dashboard (Granular Trends)
              </a>
            </div>
          </header>

          <MissionControl apiBase="/api" />

          <div className="mt-8">
            <APIPluginDashboard />
          </div>

          <div className="mt-8">
            <WorkflowDashboard />
          </div>

          <div className="mt-8">
            <UserManagement />
          </div>

          <div className="mt-8">
            <DataVisualization />
          </div>

          <div className="mt-8">
            <QADashboard />
          </div>

          <div className="mt-8">
            <APIKeyManagement />
          </div>
        </div>

        <Toaster position="top-right" />
      </main>
    </>
  );
};

export default Page;
