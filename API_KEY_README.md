# Zeta AI Dashboard API Keys

## Overview
The Zeta AI Dashboard now supports API key authentication for secure access to dashboard data. This allows external applications (like AI chatbots) to access dashboard information programmatically.

## API Key for AI Chatbot

**API Key:** `a6e971e2ad33b884996ff75dc9da0b2e497abacadaf336a0190c8fb4af3a5cad`

**Permissions:** `read`

**Created:** 2025-10-02

## Authentication Methods

### Method 1: X-API-Key Header
```bash
curl -H "X-API-Key: a6e971e2ad33b884996ff75dc9da0b2e497abacadaf336a0190c8fb4af3a5cad" \
     http://localhost:3000/api/agents
```

### Method 2: Authorization Bearer Token
```bash
curl -H "Authorization: Bearer a6e971e2ad33b884996ff75dc9da0b2e497abacadaf336a0190c8fb4af3a5cad" \
     http://localhost:3000/api/agents
```

## Available Endpoints

### 🤖 Agents Data
- **URL:** `/api/agents`
- **Method:** GET
- **Description:** Get information about active AI agents
- **Response:** List of agents with status, tasks, and health information

### 🔍 QA Data
- **URL:** `/api/qa-data`
- **Method:** GET
- **Description:** Get QA test results and historical data
- **Response:** Combined QA results and historical trends

### 🔧 Data Transformers
- **URL:** `/api/transformers`
- **Method:** GET
- **Description:** Get available data transformation tools
- **Response:** List of transformers (text preprocessing, sentiment analysis, etc.)

### 🧠 Learning Models
- **URL:** `/api/learning-models`
- **Method:** GET
- **Description:** Get information about available AI/ML models
- **Response:** List of models (GPT, BERT, ResNet, CLIP, etc.) with capabilities

### 🔌 API Plugins
- **URL:** `/api/plugins`
- **Method:** GET
- **Description:** Get available API integrations and plugins
- **Response:** List of plugins (OpenAI, Anthropic, Hugging Face, etc.)

### 📊 System Metrics
- **URL:** `/api/metrics`
- **Method:** GET
- **Description:** Get real-time system performance metrics
- **Response:** CPU, memory, workflow stats, API usage, etc.

### 📋 Additional Endpoints
- `/api/logs` - System logs and activity
- `/api/qa-results` - Raw QA test results
- `/api/workflow/status` - Current workflow execution status
- `/api/workflow/control` - Workflow management (start/stop)

## Error Responses

### 401 Unauthorized
```json
{
  "error": "API key required",
  "message": "Access denied. Please provide a valid API key."
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "message": "Required permissions: read, write"
}
```

## Usage in AI Chatbot

```javascript
// Example: Fetch agents data
async function getAgents() {
  const response = await fetch('http://localhost:3000/api/agents', {
    headers: {
      'X-API-Key': 'a6e971e2ad33b884996ff75dc9da0b2e497abacadaf336a0190c8fb4af3a5cad'
    }
  });

  if (response.ok) {
    const data = await response.json();
    console.log('Agents:', data.agents);
  } else {
    console.error('Failed to fetch agents:', response.status);
  }
}
```

## Security Notes

- Keep API keys secure and never expose them in client-side code
- API keys are tracked for last usage timestamp
- Keys can be revoked through the `/api/auth` endpoint
- All API requests are logged for monitoring

## Management

API keys can be managed through the `/api/auth` endpoint:
- `GET /api/auth` - List all keys
- `POST /api/auth` - Create new key
- `DELETE /api/auth?id=KEY_ID` - Delete key