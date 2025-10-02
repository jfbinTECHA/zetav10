import { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';

export default function QADashboard() {
  const [qaResults, setQaResults] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [highlightedItems, setHighlightedItems] = useState(new Set());
  const [notificationQueue, setNotificationQueue] = useState([]);
  const previousResults = useRef(null);

  const fetchQaResults = async () => {
    try {
      const res = await fetch('/api/qa-results');
      const data = await res.json();

      // Check for changes and highlight new failures
      if (previousResults.current) {
        const newFailures = data.results.filter(item =>
          item.status === 'failed' &&
          !previousResults.current.results.find(prev =>
            prev.id === item.id && prev.status === 'failed'
          )
        );

        if (newFailures.length > 0) {
          // Highlight new failures
          setHighlightedItems(new Set(newFailures.map(f => f.id)));

          // Add notifications
          setNotificationQueue(prev => [...prev, {
            id: Date.now(),
            type: 'failure',
            message: `${newFailures.length} new test failure(s) detected`,
            timestamp: new Date()
          }]);

          // Remove highlight after 5 seconds
          setTimeout(() => {
            setHighlightedItems(new Set());
          }, 5000);
        }
      }

      previousResults.current = data;
      setQaResults(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch QA results:', error);
    }
  };

  const dismissNotification = (id) => {
    setNotificationQueue(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    fetchQaResults();
    const interval = setInterval(fetchQaResults, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  if (!qaResults) {
    return <div className="p-6 text-center">Loading QA Results...</div>;
  }

  const passRate = qaResults.total_tests > 0
    ? ((qaResults.passed / qaResults.total_tests) * 100).toFixed(1)
    : 0;

  const chartData = {
    labels: ['Passed', 'Failed', 'Pending'],
    datasets: [{
      label: 'Test Results',
      data: [qaResults.passed, qaResults.failed, qaResults.pending],
      backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
      borderColor: ['#10B981', '#EF4444', '#F59E0B'],
      borderWidth: 1,
    }]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">QA Testing Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdate?.toLocaleTimeString()}
        </div>
      </div>

      {/* Notifications */}
      {notificationQueue.length > 0 && (
        <div className="mb-6 space-y-2">
          {notificationQueue.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-l-4 ${
                notification.type === 'failure'
                  ? 'bg-red-50 border-red-400 text-red-800'
                  : 'bg-blue-50 border-blue-400 text-blue-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{notification.message}</span>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Tests</h3>
          <p className="text-3xl font-bold text-blue-600">{qaResults.total_tests}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Pass Rate</h3>
          <p className="text-3xl font-bold text-green-600">{passRate}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Failed Tests</h3>
          <p className="text-3xl font-bold text-red-600">{qaResults.failed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Trend</h3>
          <p className={`text-3xl font-bold ${getTrendColor(qaResults.trends?.improvement_trend)}`}>
            {qaResults.trends?.improvement_trend || 'stable'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results Overview</h2>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: { beginAtZero: true }
              },
              animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
              }
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Test Results</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {(qaResults.results || []).slice(0, 10).map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border transition-all duration-500 ${
                  highlightedItems.has(item.id)
                    ? 'border-red-400 bg-red-50 shadow-lg transform scale-105'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                {item.details && (
                  <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Failures */}
      {(qaResults.trends?.recent_failures?.length > 0) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Recent Failures</h2>
          <div className="space-y-2">
            {qaResults.trends.recent_failures.map((failure, index) => (
              <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800">{failure}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}