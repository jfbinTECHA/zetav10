import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import MissionControl from '../components/MissionControl';
import { Toaster } from 'react-hot-toast';

const Page = () => {
  return (
    <>
      <Head>
        <title>Zeta AI Dashboard</title>
        <meta name="description" content="Real-time agent monitoring dashboard" />
      </Head>
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold">Zeta AI Dashboard</h1>
            <p className="text-sm text-gray-500">Mission control & agent monitoring</p>
          </header>

          <MissionControl apiBase="/api" />
        </div>

        <Toaster position="top-right" />
      </main>
    </>
  );
};

export default Page;