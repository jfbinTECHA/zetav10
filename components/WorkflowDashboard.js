import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function WorkflowDashboard() {
  const [status, setStatus] = useState(null);
  const [config, setConfig] = useState(null);
  const [logs, setLogs] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [lastStatus, setLastStatus] = useState(null);
  const fileInputRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/workflow/status');
      const data = await res.json();

      // Check for status changes and show notifications
      if (lastStatus && lastStatus.status !== data.status) {
        const notification = {
          id: Date.now(),
          type: 'status_change',
          message: `Workflow status changed from ${lastStatus.status} to ${data.status}`,
          timestamp: new Date()
        };
        setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5 notifications
      }

      setLastStatus(data);
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/workflow/config');
      const data = await res.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to fetch config:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/workflow/logs');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/workflow/images');
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/workflow/images', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      alert(data.message || data.error);
      fetchImages();
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    }
    setUploading(false);
  };

  const deleteImage = async (filename) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const res = await fetch(`/api/workflow/images?filename=${filename}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      alert(data.message || data.error);
      fetchImages();
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image');
    }
  };

  const captureScreenshot = async () => {
    try {
      // This would require additional browser APIs or a screenshot service
      alert('Screenshot capture would require additional browser permissions or a screenshot service integration');
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadImage(file);
    }
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const startWorkflow = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workflow/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      });
      const data = await res.json();
      alert(data.message || data.error);
      fetchStatus();
    } catch (error) {
      console.error('Failed to start workflow:', error);
    }
    setLoading(false);
  };

  const stopWorkflow = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workflow/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });
      const data = await res.json();
      alert(data.message || data.error);
      fetchStatus();
    } catch (error) {
      console.error('Failed to stop workflow:', error);
    }
    setLoading(false);
  };

  const updateConfig = async (newConfig) => {
    try {
      const res = await fetch('/api/workflow/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      const data = await res.json();
      alert(data.message || data.error);
      fetchConfig();
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchConfig();
    fetchLogs();
    fetchImages();

    // Poll for status updates every 5 seconds
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'stopped': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">ZetaV10 Workflow Dashboard</h1>

      {/* Real-time Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-sm opacity-75">{notification.timestamp.toLocaleTimeString()}</p>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="ml-4 text-blue-400 hover:text-blue-600"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Workflow Status</h2>
        {status ? (
          <div className="space-y-2">
            <p><strong>Status:</strong> <span className={getStatusColor(status.status)}>{status.status}</span></p>
            <p><strong>Message:</strong> {status.message}</p>
            <p><strong>Last Updated:</strong> {status.timestamp ? new Date(status.timestamp).toLocaleString() : 'N/A'}</p>
            {status.pid && <p><strong>Process ID:</strong> {status.pid}</p>}
          </div>
        ) : (
          <p>Loading status...</p>
        )}

        <div className="mt-4 space-x-4">
          <button
            onClick={startWorkflow}
            disabled={loading || status?.status === 'running'}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading ? 'Starting...' : 'Start Workflow'}
          </button>
          <button
            onClick={stopWorkflow}
            disabled={loading || status?.status !== 'running'}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            Stop Workflow
          </button>
          <button
            onClick={fetchStatus}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Refresh Status
          </button>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        {config ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Dry Run</label>
                <input
                  type="checkbox"
                  checked={config.dry_run}
                  onChange={(e) => setConfig({...config, dry_run: e.target.checked})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Log Directory</label>
                <input
                  type="text"
                  value={config.log_dir}
                  onChange={(e) => setConfig({...config, log_dir: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Logs</label>
                <input
                  type="number"
                  value={config.max_logs}
                  onChange={(e) => setConfig({...config, max_logs: parseInt(e.target.value)})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Backup Count</label>
                <input
                  type="number"
                  value={config.backup_count}
                  onChange={(e) => setConfig({...config, backup_count: parseInt(e.target.value)})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
            <button
              onClick={() => updateConfig(config)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              Update Configuration
            </button>
          </div>
        ) : (
          <p>Loading configuration...</p>
        )}
      </div>

      {/* Logs Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Latest Logs</h2>
        {logs ? (
          <div>
            <p className="mb-2"><strong>File:</strong> {logs.filename} ({logs.lines} lines)</p>
            <pre className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto text-sm">
              {logs.content}
            </pre>
            <button
              onClick={fetchLogs}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Refresh Logs
            </button>
          </div>
        ) : (
          <p>Loading logs...</p>
        )}
      </div>

      {/* Images Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Workflow Images</h2>

        {/* Upload Controls */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-medium mb-3">Upload Images</h3>
          <div className="flex space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
            >
              {uploading ? 'Uploading...' : 'Choose Image'}
            </button>
            <button
              onClick={captureScreenshot}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              Capture Screenshot
            </button>
            <button
              onClick={fetchImages}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Refresh Gallery
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div>
          <h3 className="text-lg font-medium mb-3">Image Gallery ({images.length} images)</h3>
          {images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.name} className="border rounded-lg p-3 bg-gray-50">
                  <Image
                    src={image.path}
                    alt={image.name}
                    width={300}
                    height={128}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium truncate">{image.name}</p>
                    <p>Size: {(image.size / 1024).toFixed(1)} KB</p>
                    <p>Created: {new Date(image.created).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-2 flex space-x-2">
                    <a
                      href={image.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                    >
                      View
                    </a>
                    <button
                      onClick={() => deleteImage(image.name)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No images uploaded yet. Upload some workflow screenshots or artifacts!</p>
          )}
        </div>
      </div>
    </div>
  );
}