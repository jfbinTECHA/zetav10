# API Key Management Manual

## Overview

The Zeta AI Dashboard includes a comprehensive API Key Management system that allows you to create, manage, and monitor API keys for secure access to dashboard data. This system is essential for allowing external applications (like AI chatbots, mobile apps, or third-party services) to access dashboard information programmatically.

## Accessing API Key Management

1. **Open the Dashboard**: Navigate to your Zeta AI Dashboard at `http://localhost:3000` (local) or your Vercel deployment URL
2. **Scroll to Bottom**: The API Key Management section is located at the bottom of the main dashboard
3. **Section Title**: Look for "API Key Management" header

## Creating Your First API Key

### Step-by-Step Guide

1. **Navigate to Create Section**
   - Scroll down to the "Create New API Key" section
   - You'll see a form with input fields

2. **Enter Key Details**
   - **Key Name**: Enter a descriptive name (e.g., "AI Chatbot", "Mobile App", "Data Analytics Service")
   - **Permissions**: Select the appropriate permission level:
     - `read` - Can only view data (recommended for most applications)
     - `write` - Can view and modify data
     - `admin` - Full access including system administration

3. **Create the Key**
   - Click the "Create API Key" button
   - A success notification will appear showing your new API key
   - **Important**: Copy and save the API key immediately - it won't be shown again for security reasons

4. **Key Generated**
   - The key will be automatically added to the "Existing API Keys" table
   - You can see the key's ID, name, permissions, creation date, and last used timestamp

## Managing Existing API Keys

### Viewing API Keys

The "Existing API Keys" table shows all your API keys with the following information:

- **Name**: The descriptive name you gave the key
- **Permissions**: Permission badges (color-coded: green=read, yellow=write, red=admin)
- **Created**: When the key was created
- **Last Used**: When the key was last used to access an API endpoint
- **Actions**: Available actions for each key

### Key Actions

#### Copy Key ID
- Click the "Copy ID" button next to any key
- The key's unique identifier will be copied to your clipboard
- Useful for referencing specific keys in logs or configurations

#### Delete API Key
- Click the "Delete" button next to the key you want to remove
- A confirmation dialog will appear asking you to confirm
- **Warning**: This action cannot be undone
- The key will immediately lose access to all API endpoints

## Using API Keys in Your Applications

### Authentication Methods

#### Method 1: X-API-Key Header (Recommended)
```javascript
const API_KEY = 'your-api-key-here';

fetch('http://localhost:3000/api/agents', {
  headers: {
    'X-API-Key': API_KEY
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

#### Method 2: Authorization Bearer Token
```javascript
const API_KEY = 'your-api-key-here';

fetch('http://localhost:3000/api/agents', {
  headers: {
    'Authorization': `Bearer ${API_KEY}`
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Python Example
```python
import requests

API_KEY = 'your-api-key-here'
headers = {'X-API-Key': API_KEY}

response = requests.get('http://localhost:3000/api/agents', headers=headers)
data = response.json()
print(data)
```

### cURL Example
```bash
curl -H "X-API-Key: your-api-key-here" \
     http://localhost:3000/api/agents
```

## Available API Endpoints

### 🤖 Agents Data
- **URL**: `/api/agents`
- **Method**: GET
- **Description**: Get information about active AI agents
- **Response**: List of agents with status, tasks, and health information

### 🔧 Data Transformers
- **URL**: `/api/transformers`
- **Method**: GET
- **Description**: Get available data transformation tools
- **Response**: List of transformers (text preprocessing, sentiment analysis, etc.)

### 🧠 Learning Models
- **URL**: `/api/learning-models`
- **Method**: GET
- **Description**: Get information about available AI/ML models
- **Response**: List of models (GPT, BERT, ResNet, CLIP, etc.) with capabilities

### 🔌 API Plugins
- **URL**: `/api/plugins`
- **Method**: GET
- **Description**: Get available API integrations and plugins
- **Response**: List of plugins (OpenAI, Anthropic, Hugging Face, etc.)

### 📊 System Metrics
- **URL**: `/api/metrics`
- **Method**: GET
- **Description**: Get real-time system performance metrics
- **Response**: CPU, memory, workflow stats, API usage, etc.

### 🔍 QA Data
- **URL**: `/api/qa-data`
- **Method**: GET
- **Description**: Get QA test results and historical data
- **Response**: Combined QA results and historical trends

## Permission Levels Explained

### Read Permission (`read`)
- Access to view data from all endpoints
- Cannot modify any data
- Safe for most applications and analytics tools
- Recommended for AI chatbots and monitoring systems

### Write Permission (`write`)
- All read permissions plus ability to modify data
- Can update configurations and submit data
- Use for applications that need to interact with the system
- Not recommended for public-facing applications

### Admin Permission (`admin`)
- Full system access including user management
- Can create/delete API keys and manage system settings
- Only use for trusted administrative applications
- Highest security risk if compromised

## Security Best Practices

### 🔐 Key Security
1. **Never expose API keys** in client-side code or public repositories
2. **Use environment variables** to store API keys in your applications
3. **Rotate keys regularly** for critical applications
4. **Monitor usage** through the "Last Used" timestamps

### 🔍 Monitoring
1. **Regularly check** the API Key Management dashboard
2. **Review "Last Used" timestamps** to identify inactive keys
3. **Delete unused keys** to reduce security surface
4. **Monitor for unusual activity** patterns

### 🚨 Incident Response
1. **Immediately delete** compromised keys
2. **Create new keys** with different permissions if needed
3. **Review access logs** to understand the breach scope
4. **Update all applications** using the compromised key

## Troubleshooting

### Common Issues

#### 401 Unauthorized Error
```
{"error": "API key required", "message": "Access denied. Please provide a valid API key."}
```
**Solution**: Ensure you're including the API key in your request headers

#### 403 Forbidden Error
```
{"error": "Insufficient permissions", "message": "Required permissions: read, write"}
```
**Solution**: Check that your API key has the required permissions for the endpoint

#### Key Not Working
- Verify the key wasn't deleted
- Check that you're using the correct key value
- Ensure the key hasn't expired (if expiration was set)
- Confirm the application is sending requests to the correct URL

### Testing Your API Key

Use this simple test to verify your key is working:

```bash
# Replace YOUR_API_KEY with your actual key
curl -H "X-API-Key: YOUR_API_KEY" \
     http://localhost:3000/api/agents
```

Expected response: JSON data about agents (not an error)

## Advanced Configuration

### Environment Variables (for Vercel deployment)
```env
# Add to your Vercel environment variables
API_KEY_EXPIRY=30  # Days until key expires (optional)
API_KEY_MAX_KEYS=10  # Maximum number of keys per user (optional)
```

### Custom Permissions
The system supports custom permission levels. Contact your administrator to configure additional permission types for specific use cases.

## Support

### Getting Help
- Check the API Key Management dashboard for real-time status
- Review the "Usage Instructions" section in the dashboard
- Test endpoints using the provided cURL examples
- Monitor the "Last Used" timestamps for activity verification

### Error Reporting
If you encounter persistent issues:
1. Note the exact error message
2. Include your API key ID (not the full key)
3. Describe the endpoint and method you were trying to access
4. Include timestamp of the error

---

**Remember**: API keys provide access to your dashboard data. Keep them secure and monitor their usage regularly. 🔐