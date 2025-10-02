import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DataVisualization() {
  const [metrics, setMetrics] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(false);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics');
      const data = await res.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const exportData = (format) => {
    if (!metrics) return;

    const dataStr = format === 'json'
      ? JSON.stringify(metrics, null, 2)
      : Object.entries(metrics)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join('\n');

    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zeta-metrics.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return <div className="p-6 text-center">Loading metrics...</div>;
  }

  // System Performance Chart
  const systemChartData = {
    labels: ['CPU', 'Memory', 'Disk'],
    datasets: [{
      label: 'Usage %',
      data: [
        metrics.system.cpu.toFixed(1),
        metrics.system.memory.toFixed(1),
        metrics.system.disk.toFixed(1)
      ],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      borderColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      borderWidth: 1,
    }]
  };

  // Workflow Status Chart
  const workflowChartData = {
    labels: ['Running', 'Completed', 'Failed'],
    datasets: [{
      data: [
        metrics.workflows.running,
        metrics.workflows.completed,
        metrics.workflows.failed
      ],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
    }]
  };

  // API Performance Chart
  const apiChartData = {
    labels: Array.from({length: 24}, (_, i) => `${i}:00`),
    datasets: [{
      label: 'Requests',
      data: Array.from({length: 24}, () => Math.floor(Math.random() * 100) + 20),
      borderColor: '#36A2EB',
      backgroundColor: 'rgba(54, 162, 235, 0.1)',
      tension: 0.4
    }]
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Data Visualization & Analytics</h1>
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={() => exportData('json')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Export JSON
          </button>
          <button
            onClick={() => exportData('txt')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Export TXT
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">System Uptime</h3>
          <p className="text-3xl font-bold text-green-600">{formatUptime(metrics.system.uptime)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Active Workflows</h3>
          <p className="text-3xl font-bold text-blue-600">{metrics.workflows.running}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">API Requests Today</h3>
          <p className="text-3xl font-bold text-purple-600">{metrics.api.requests_today.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Success Rate</h3>
          <p className="text-3xl font-bold text-green-600">{metrics.workflows.success_rate}%</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* System Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">System Performance</h2>
          <Bar
            data={systemChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: { display: true, text: 'Usage %' }
                }
              }
            }}
          />
        </div>

        {/* Workflow Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Workflow Distribution</h2>
          <Doughnut
            data={workflowChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'bottom' }
              }
            }}
          />
        </div>
      </div>

      {/* API Performance Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">API Request Trends (24h)</h2>
        <Line
          data={apiChartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Requests' }
              },
              x: {
                title: { display: true, text: 'Hour' }
              }
            }
          }}
        />
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Metrics</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  CPU Usage
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.system.cpu.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    metrics.system.cpu > 80 ? 'bg-red-100 text-red-800' :
                    metrics.system.cpu > 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {metrics.system.cpu > 80 ? 'High' : metrics.system.cpu > 60 ? 'Medium' : 'Normal'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Memory Usage
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.system.memory.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    metrics.system.memory > 80 ? 'bg-red-100 text-red-800' :
                    metrics.system.memory > 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {metrics.system.memory > 80 ? 'High' : metrics.system.memory > 60 ? 'Medium' : 'Normal'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  API Response Time
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.api.avg_response_time.toFixed(0)}ms
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    metrics.api.avg_response_time > 500 ? 'bg-red-100 text-red-800' :
                    metrics.api.avg_response_time > 200 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {metrics.api.avg_response_time > 500 ? 'Slow' : metrics.api.avg_response_time > 200 ? 'Moderate' : 'Fast'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Error Rate
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.api.error_rate.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    metrics.api.error_rate > 5 ? 'bg-red-100 text-red-800' :
                    metrics.api.error_rate > 1 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {metrics.api.error_rate > 5 ? 'High' : metrics.api.error_rate > 1 ? 'Moderate' : 'Low'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}