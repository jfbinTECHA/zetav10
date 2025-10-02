import { useState, useEffect, memo } from 'react';

const APIPluginDashboard = memo(function APIPluginDashboard() {
  const [plugins, setPlugins] = useState([]);
  const [transformers, setTransformers] = useState([]);
  const [learningModels, setLearningModels] = useState([]);
  const [localModels, setLocalModels] = useState([]);
  const [activeTab, setActiveTab] = useState('plugins');
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [selectedTransformer, setSelectedTransformer] = useState(null);
  const [selectedLearningModel, setSelectedLearningModel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [localTestInput, setLocalTestInput] = useState('');
  const [localTestOutput, setLocalTestOutput] = useState('');
  const [localModelStatus, setLocalModelStatus] = useState('checking');

  useEffect(() => {
    loadPlugins();
    loadTransformers();
    loadLearningModels();
    loadLocalModels();
  }, []);

  const loadPlugins = async () => {
    try {
      const response = await fetch('/api/plugins');
      if (response.ok) {
        const data = await response.json();
        setPlugins(data);
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  };

  const loadTransformers = async () => {
    try {
      const response = await fetch('/api/transformers');
      if (response.ok) {
        const data = await response.json();
        setTransformers(data);
      }
    } catch (error) {
      console.error('Failed to load transformers:', error);
    }
  };

  const loadLearningModels = async () => {
    try {
      const response = await fetch('/api/learning-models');
      if (response.ok) {
        const data = await response.json();
        setLearningModels(data);
      }
    } catch (error) {
      console.error('Failed to load learning models:', error);
    }
  };

  const loadLocalModels = async () => {
    try {
      // Mock local models data - in reality this would check the local_model.py setup
      const localModelsData = [
        {
          id: 'dialoGPT-small',
          name: 'DialoGPT Small',
          description: 'Microsoft\'s DialoGPT-small for local conversational AI',
          type: 'conversational',
          framework: 'Hugging Face Transformers',
          status: 'available',
          privacy: 'local-only',
          parameters: '117M',
          languages: ['en'],
          capabilities: ['conversation', 'text-generation']
        }
      ];
      setLocalModels(localModelsData);

      // Check if local model is working
      await checkLocalModelStatus();
    } catch (error) {
      console.error('Failed to load local models:', error);
      setLocalModelStatus('error');
    }
  };

  const checkLocalModelStatus = async () => {
    try {
      setLocalModelStatus('checking');
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello' }],
          context: {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.source === 'local-model' || data.source === 'local') {
          setLocalModelStatus('active');
        } else {
          setLocalModelStatus('external');
        }
      } else {
        setLocalModelStatus('error');
      }
    } catch (error) {
      console.error('Failed to check local model status:', error);
      setLocalModelStatus('error');
    }
  };

  const testTransformer = async (transformerId) => {
    if (!testInput.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/transformers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transformerId,
          input: testInput
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTestOutput(JSON.stringify(result.output, null, 2));
      } else {
        setTestOutput('Error: ' + response.statusText);
      }
    } catch (error) {
      setTestOutput('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testLocalModel = async () => {
    if (!localTestInput.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: localTestInput }],
          context: {}
        })
      });

      if (response.ok) {
        const result = await response.json();
        setLocalTestOutput(`[${result.source}] ${result.response}`);
      } else {
        setLocalTestOutput('Error: ' + response.statusText);
      }
    } catch (error) {
      setLocalTestOutput('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlugin = async (pluginId, enabled) => {
    try {
      const response = await fetch(`/api/plugins/${pluginId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        loadPlugins();
      }
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🔌 API Plugin Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('plugins')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'plugins'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            API Plugins ({plugins.length})
          </button>
          <button
            onClick={() => setActiveTab('transformers')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'transformers'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Data Transformers ({transformers.length})
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'models'
                ? 'bg-blue-500 text-white'
                : 'bg-blue-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Learning Models ({learningModels.length})
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'local'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Local AI ({localModels.length})
          </button>
        </div>
      </div>

      {activeTab === 'plugins' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plugins.map(plugin => (
              <div key={plugin.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{plugin.name}</h3>
                    <p className="text-sm text-gray-600">{plugin.description}</p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={plugin.enabled}
                      onChange={(e) => togglePlugin(plugin.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Version:</span>
                    <span>{plugin.version}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="capitalize">{plugin.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      plugin.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {plugin.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPlugin(plugin)}
                  className="mt-3 w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Configure
                </button>
              </div>
            ))}
          </div>

          {plugins.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No API plugins installed</p>
              <p className="text-sm">Install plugins to extend functionality</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'transformers' && (
        <div className="space-y-6">
          {/* Test Input Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">🧪 Test Data Transformer</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Data (JSON)
                </label>
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder='{"data": "example", "values": [1, 2, 3]}'
                  className="w-full h-24 p-2 border rounded font-mono text-sm"
                />
              </div>

              <div className="flex space-x-2">
                {transformers.map(transformer => (
                  <button
                    key={transformer.id}
                    onClick={() => testTransformer(transformer.id)}
                    disabled={isLoading || !testInput.trim()}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
                  >
                    Test {transformer.name}
                  </button>
                ))}
              </div>

              {testOutput && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Output
                  </label>
                  <pre className="w-full h-24 p-2 bg-white border rounded font-mono text-sm overflow-auto">
                    {testOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Transformers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transformers.map(transformer => (
              <div key={transformer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{transformer.name}</h3>
                    <p className="text-sm text-gray-600">{transformer.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    transformer.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transformer.status}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Input Type:</span>
                    <span className="font-mono">{transformer.inputType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Output Type:</span>
                    <span className="font-mono">{transformer.outputType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Model:</span>
                    <span>{transformer.model || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedTransformer(transformer)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Configure
                  </button>
                  <button
                    onClick={() => testTransformer(transformer.id)}
                    disabled={!testInput.trim()}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
                  >
                    Test
                  </button>
                </div>
              </div>
            ))}
          </div>

          {transformers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No data transformers available</p>
              <p className="text-sm">Add transformers to process learning model data</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'models' && (
        <div className="space-y-6">
          {/* Model Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800">Total Models</h4>
              <p className="text-2xl font-bold text-blue-600">{learningModels.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800">Active Models</h4>
              <p className="text-2xl font-bold text-green-600">
                {learningModels.filter(m => m.status === 'active').length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800">Avg Accuracy</h4>
              <p className="text-2xl font-bold text-purple-600">
                {(learningModels.reduce((sum, m) => sum + (m.accuracy || 0), 0) / learningModels.length * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-800">Avg Latency</h4>
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(learningModels.reduce((sum, m) => sum + parseInt(m.latency || '0'), 0) / learningModels.length)}ms
              </p>
            </div>
          </div>

          {/* Models List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningModels.map(model => (
              <div key={model.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{model.name}</h3>
                    <p className="text-sm text-gray-600">{model.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      model.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {model.status}
                    </span>
                    <span className="text-xs text-gray-500">{model.provider}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type:</span>
                      <span className="capitalize">{model.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Architecture:</span>
                      <span className="capitalize">{model.architecture.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Parameters:</span>
                      <span>{model.parameters}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Accuracy:</span>
                      <span>{model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Latency:</span>
                      <span>{model.latency || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Cost/Token:</span>
                      <span>{model.costPerToken ? `$${model.costPerToken}` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {model.capabilities.map((capability, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {capability.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedLearningModel(model)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Configure
                  </button>
                  <button
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                  >
                    Test Model
                  </button>
                </div>
              </div>
            ))}
          </div>

          {learningModels.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No learning models available</p>
              <p className="text-sm">Add models to enable AI capabilities</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'local' && (
        <div className="space-y-6">
          {/* Local AI Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800">Local AI Status</h4>
              <div className="flex items-center mt-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  localModelStatus === 'active' ? 'bg-green-500' :
                  localModelStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`}></div>
                <p className="text-lg font-bold text-green-600 capitalize">
                  {localModelStatus === 'active' ? 'Active' :
                   localModelStatus === 'checking' ? 'Checking...' :
                   localModelStatus === 'external' ? 'Using External' : 'Error'}
                </p>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800">Privacy Level</h4>
              <p className="text-2xl font-bold text-blue-600">🔒 Local</p>
              <p className="text-sm text-blue-600">No data sent externally</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800">Models Available</h4>
              <p className="text-2xl font-bold text-purple-600">{localModels.length}</p>
              <p className="text-sm text-purple-600">Running locally</p>
            </div>
          </div>

          {/* Test Local AI */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">🧪 Test Local AI Model</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Message
                </label>
                <input
                  type="text"
                  value={localTestInput}
                  onChange={(e) => setLocalTestInput(e.target.value)}
                  placeholder="Enter a test message..."
                  className="w-full p-2 border rounded"
                />
              </div>

              <button
                onClick={testLocalModel}
                disabled={isLoading || !localTestInput.trim() || localModelStatus !== 'active'}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading ? 'Testing...' : 'Test Local AI'}
              </button>

              {localTestOutput && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Response
                  </label>
                  <div className="w-full p-2 bg-white border rounded font-mono text-sm">
                    {localTestOutput}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Local Models List */}
          <div className="grid grid-cols-1 gap-4">
            {localModels.map(model => (
              <div key={model.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{model.name}</h3>
                    <p className="text-sm text-gray-600">{model.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      model.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {model.status}
                    </span>
                    <span className="text-xs text-green-600 font-semibold">🔒 Private</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Framework:</span>
                      <span>{model.framework}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Parameters:</span>
                      <span>{model.parameters}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type:</span>
                      <span className="capitalize">{model.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Languages:</span>
                      <span>{model.languages?.join(', ') || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {model.capabilities.map((capability, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {capability.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => checkLocalModelStatus()}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Check Status
                  </button>
                  <button
                    onClick={() => testLocalModel()}
                    disabled={!localTestInput.trim()}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
                  >
                    Test Model
                  </button>
                </div>
              </div>
            ))}
          </div>

          {localModels.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No local models configured</p>
              <p className="text-sm">Set up local_model.py to enable private AI</p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">🔒 Privacy Protection</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• All processing happens locally on your machine</li>
              <li>• No data is sent to external AI providers</li>
              <li>• Conversations remain completely private</li>
              <li>• Models run using Hugging Face Transformers</li>
            </ul>
          </div>
        </div>
      )}

      {/* Plugin Configuration Modal */}
      {selectedPlugin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Configure {selectedPlugin.name}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Endpoint
                </label>
                <input
                  type="url"
                  defaultValue={selectedPlugin.endpoint}
                  className="w-full p-2 border rounded"
                  placeholder="https://api.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  defaultValue={selectedPlugin.apiKey}
                  className="w-full p-2 border rounded"
                  placeholder="Enter API key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Limit (requests/minute)
                </label>
                <input
                  type="number"
                  defaultValue={selectedPlugin.rateLimit || 60}
                  className="w-full p-2 border rounded"
                  min="1"
                  max="1000"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedPlugin(null)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transformer Configuration Modal */}
      {selectedTransformer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Configure {selectedTransformer.name}</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Configuration
                </label>
                <textarea
                  defaultValue={JSON.stringify(selectedTransformer.config, null, 2)}
                  className="w-full h-32 p-2 border rounded font-mono text-sm"
                  placeholder='{"model": "gpt-3.5-turbo", "temperature": 0.7}'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preprocessing Steps
                </label>
                <textarea
                  defaultValue={selectedTransformer.preprocessing?.join('\n') || ''}
                  className="w-full h-24 p-2 border rounded font-mono text-sm"
                  placeholder="normalize_text&#10;remove_stopwords&#10;tokenize"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postprocessing Steps
                </label>
                <textarea
                  defaultValue={selectedTransformer.postprocessing?.join('\n') || ''}
                  className="w-full h-24 p-2 border rounded font-mono text-sm"
                  placeholder="decode_tokens&#10;format_output&#10;validate_result"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedTransformer(null)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Learning Model Configuration Modal */}
      {selectedLearningModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Configure {selectedLearningModel.name}</h3>

            <div className="space-y-6">
              {/* Model Info */}
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-semibold mb-2">Model Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Provider:</span> {selectedLearningModel.provider}
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span> {selectedLearningModel.type}
                  </div>
                  <div>
                    <span className="text-gray-500">Architecture:</span> {selectedLearningModel.architecture}
                  </div>
                  <div>
                    <span className="text-gray-500">Parameters:</span> {selectedLearningModel.parameters}
                  </div>
                  <div>
                    <span className="text-gray-500">Training Data:</span> {selectedLearningModel.trainingData}
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      selectedLearningModel.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedLearningModel.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-semibold mb-2">Performance Metrics</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedLearningModel.accuracy ? `${(selectedLearningModel.accuracy * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                    <div className="text-gray-600">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedLearningModel.latency || 'N/A'}
                    </div>
                    <div className="text-gray-600">Latency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedLearningModel.costPerToken ? `$${selectedLearningModel.costPerToken}` : 'N/A'}
                    </div>
                    <div className="text-gray-600">Cost/Token</div>
                  </div>
                </div>
              </div>

              {/* Configuration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Configuration (JSON)
                </label>
                <textarea
                  defaultValue={JSON.stringify(selectedLearningModel.config, null, 2)}
                  className="w-full h-48 p-2 border rounded font-mono text-sm"
                  placeholder='{"temperature": 0.7, "maxTokens": 1000}'
                />
              </div>

              {/* Capabilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capabilities
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedLearningModel.capabilities.map((capability, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {capability.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* API Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Endpoint
                  </label>
                  <input
                    type="url"
                    defaultValue={`https://api.${selectedLearningModel.provider.toLowerCase()}.com/v1/${selectedLearningModel.id}`}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    defaultValue=""
                    className="w-full p-2 border rounded"
                    placeholder="Enter API key"
                  />
                </div>
              </div>

              {/* Rate Limiting */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate Limit (requests/minute)
                  </label>
                  <input
                    type="number"
                    defaultValue="60"
                    className="w-full p-2 border rounded"
                    min="1"
                    max="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full p-2 border rounded"
                    min="1"
                    max="300"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setSelectedLearningModel(null)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

APIPluginDashboard.displayName = 'APIPluginDashboard';

export default APIPluginDashboard;