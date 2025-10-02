import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const APIKeyManagement = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState(['read']);
  const [customKeyValue, setCustomKeyValue] = useState('');
  const [useCustomKey, setUseCustomKey] = useState(false);
  const [envVarName, setEnvVarName] = useState('');

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/auth');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys || []);
      } else {
        toast.error('Failed to fetch API keys');
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Error fetching API keys');
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    if (useCustomKey && !customKeyValue.trim()) {
      toast.error('Please enter a custom API key value');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newKeyName.trim(),
          permissions: newKeyPermissions,
          customKey: useCustomKey ? customKeyValue.trim() : null,
          envVar: envVarName.trim() || null,
        }),
      });

      if (response.ok) {
        const newKey = await response.json();
        toast.success(`API Key created: ${newKey.key.substring(0, 20)}...`);
        setNewKeyName('');
        setNewKeyPermissions(['read']);
        setCustomKeyValue('');
        setUseCustomKey(false);
        setEnvVarName('');
        fetchApiKeys(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Error creating API key');
    } finally {
      setCreating(false);
    }
  };

  const deleteApiKey = async (keyId, keyName) => {
    if (!confirm(`Are you sure you want to delete the API key "${keyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/auth?id=${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('API key deleted successfully');
        fetchApiKeys(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Error deleting API key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading API keys...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">API Key Management</h1>
        <div className="text-sm text-gray-500">
          Total Keys: {apiKeys.length}
        </div>
      </div>

      {/* Create New API Key Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New API Key</h2>

        {/* Key Generation Mode Toggle */}
        <div className="mb-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="keyMode"
                checked={!useCustomKey}
                onChange={() => setUseCustomKey(false)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Auto-generate key</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="keyMode"
                checked={useCustomKey}
                onChange={() => setUseCustomKey(true)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Enter custom key</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key Name
            </label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., AI Chatbot, Mobile App"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {useCustomKey && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key Value
              </label>
              <input
                type="text"
                value={customKeyValue}
                onChange={(e) => setCustomKeyValue(e.target.value)}
                placeholder="Enter your API key value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environment Variable (Optional)
            </label>
            <input
              type="text"
              value={envVarName}
              onChange={(e) => setEnvVarName(e.target.value)}
              placeholder="e.g., MY_API_KEY"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <select
              multiple
              value={newKeyPermissions}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setNewKeyPermissions(values);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="read">Read (Access data)</option>
              <option value="write">Write (Modify data)</option>
              <option value="admin">Admin (Full access)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={createApiKey}
            disabled={creating}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            {creating ? 'Creating...' : 'Add API Key'}
          </button>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Existing API Keys</h2>
        </div>

        {apiKeys.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No API keys found. Create your first API key above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {key.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {key.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.map((perm) => (
                          <span
                            key={perm}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              perm === 'admin'
                                ? 'bg-red-100 text-red-800'
                                : perm === 'write'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(key.created)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {key.lastUsed ? formatDate(key.lastUsed) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => copyToClipboard(key.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Copy ID
                      </button>
                      <button
                        onClick={() => deleteApiKey(key.id, key.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">API Usage</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>Authentication:</strong> Include API key in headers:</p>
          <code className="block bg-blue-100 p-2 rounded text-xs">
            X-API-Key: your-api-key-here
          </code>
          <p><strong>Available Endpoints:</strong> /api/agents, /api/transformers, /api/learning-models, /api/plugins, /api/metrics, /api/qa-data</p>
        </div>
      </div>
    </div>
  );
};

export default APIKeyManagement;