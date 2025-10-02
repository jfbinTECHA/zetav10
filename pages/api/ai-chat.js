export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, context } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Check for API key - prioritize GPT-4, then other models
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const huggingfaceKey = process.env.HUGGINGFACE_API_KEY;

  if (!openaiKey && !anthropicKey && !huggingfaceKey) {
    // Fallback to local AI system
    return handleLocalFallback(messages, context, res);
  }

  try {
     let aiResponse;
     let modelUsed = 'local';

     if (openaiKey) {
       // OpenAI GPT-4 integration (prioritized)
       aiResponse = await callOpenAI(messages, context);
       modelUsed = 'gpt-4';
     } else if (anthropicKey) {
       // Anthropic Claude integration
       aiResponse = await callAnthropic(messages, context);
       modelUsed = 'claude-3';
     } else if (huggingfaceKey) {
       // Hugging Face model integration
       aiResponse = await callHuggingFace(messages, context);
       modelUsed = 'huggingface';
     } else {
       return handleLocalFallback(messages, context, res);
     }

    return res.status(200).json({
      response: aiResponse.content || aiResponse,
      source: modelUsed,
      usage: aiResponse.usage || null,
      model: modelUsed
    });

  } catch (error) {
    console.error('AI API error:', error);

    // Fallback to local system on API errors
    return handleLocalFallback(messages, context, res);
  }
}

async function callOpenAI(messages, context) {
  const systemPrompt = buildSystemPrompt(context);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.content
        }))
      ],
      max_tokens: 2000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: data.usage,
    function_call: data.choices[0].message.function_call
  };
}

async function callAnthropic(messages, context) {
  const systemPrompt = buildSystemPrompt(context);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }))
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    usage: data.usage
  };
}

async function callHuggingFace(messages, context) {
  const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

  if (!HUGGINGFACE_API_KEY) {
    throw new Error('Hugging Face API key not configured');
  }

  try {
    // Use a conversational model
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          past_user_inputs: messages.filter(m => m.role === 'user').slice(-3).map(m => m.content),
          generated_responses: messages.filter(m => m.role === 'ai').slice(-3).map(m => m.content),
          text: messages[messages.length - 1].content
        },
        parameters: {
          max_length: 100,
          temperature: 0.7,
          do_sample: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.generated_text || data[0]?.generated_text || 'I\'m processing your request...',
      usage: null
    };
  } catch (error) {
    console.error('Hugging Face API error:', error);
    throw error;
  }
}

function buildSystemPrompt(context) {
  return `You are an advanced AI coding assistant integrated with a sophisticated local learning system.

CONTEXT INFORMATION:
- Learned Knowledge: ${JSON.stringify(context.learnedData || {})}
- Current Agent: ${context.currentAgent || 'general'}
- Agent Personality: ${JSON.stringify(context.agentPersonality || {})}
- Conversation History: ${context.recentMessages?.length || 0} messages

CAPABILITIES:
- Generate React components and code
- Access web scraping functionality
- Self-improvement and learning
- Multi-agent coordination
- Natural conversation

INSTRUCTIONS:
- Be helpful, witty, and engaging
- Reference learned knowledge when relevant
- Use the available tools when appropriate
- Maintain conversation context
- Provide high-quality, working code examples

Always respond naturally and intelligently, leveraging both your general knowledge and the specific context provided.`;
}

function handleLocalFallback(messages, context, res) {
  // Get the last user message
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  if (!lastUserMessage) {
    return res.status(400).json({ error: 'No user message found' });
  }

  const prompt = lastUserMessage.content.toLowerCase();

  // Simple local response generation
  let response = '';
  let code = null;

  if (prompt.includes('hello') || prompt.includes('hi')) {
    response = 'Hello! I\'m your AI assistant. How can I help you with coding today?';
  } else if (prompt.includes('button')) {
    response = 'Here\'s a simple React button component:';
    code = `function MyButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      {children}
    </button>
  );
}`;
  } else if (prompt.includes('form')) {
    response = 'Here\'s a basic form component:';
    code = `function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      <button type="submit">Submit</button>
    </form>
  );
}`;
  } else {
    response = 'I\'m here to help with coding! Try asking me to create a button, form, or component. I can also help with web scraping and learning from data.';
  }

  return res.status(200).json({
    response,
    code,
    source: 'local',
    fallback: true
  });
}