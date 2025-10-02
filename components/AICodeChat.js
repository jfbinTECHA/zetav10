import { useState, useEffect } from 'react';

const agentPersonalities = {
  general: {
    name: 'AI Assistant',
    role: 'General Purpose',
    greeting: 'Hello! I\'m your AI assistant. How can I help you today?',
    style: 'Friendly and helpful',
    knowledgeDomain: 'general programming and technology'
  },
  chrono: {
    name: 'Chrono',
    role: 'Medical Informatics',
    greeting: 'Greetings! I am Chrono, specializing in medical data analysis and healthcare informatics.',
    style: 'Professional, data-focused, healthcare-oriented',
    knowledgeDomain: 'medical informatics and healthcare data analysis'
  },
  vega: {
    name: 'Vega',
    role: 'UX & Engagement',
    greeting: 'Hi there! I\'m Vega, your UX and user engagement specialist. Let\'s make interfaces amazing!',
    style: 'Creative, user-centric, design-focused',
    knowledgeDomain: 'user experience design and interface optimization'
  },
  aria: {
    name: 'Aria',
    role: 'Research & Data Discovery',
    greeting: 'Hello! I\'m Aria, dedicated to research and data discovery. What knowledge shall we uncover?',
    style: 'Analytical, research-oriented, curious',
    knowledgeDomain: 'academic research and data discovery methodologies'
  },
  kilo: {
    name: 'Kilo Code',
    role: 'AI Developer',
    greeting: 'Hey! Kilo Code here, your AI development expert. Ready to build some intelligent systems?',
    style: 'Technical, coding-focused, innovative',
    knowledgeDomain: 'artificial intelligence and machine learning development'
  }
};

const getSubtopicsForDomain = (domain) => {
  const subtopics = {
    'medical informatics and healthcare data analysis': [
      'electronic health records',
      'predictive diagnostics',
      'telemedicine platforms',
      'healthcare AI ethics',
      'patient data privacy',
      'clinical decision support'
    ],
    'user experience design and interface optimization': [
      'accessibility standards',
      'mobile-first design',
      'user behavior analytics',
      'design systems',
      'usability testing',
      'interaction design'
    ],
    'academic research and data discovery methodologies': [
      'systematic literature review',
      'meta-analysis techniques',
      'research data management',
      'open science practices',
      'peer review processes',
      'citation analysis'
    ],
    'artificial intelligence and machine learning development': [
      'neural network architectures',
      'deep learning frameworks',
      'reinforcement learning',
      'natural language processing',
      'computer vision',
      'AI ethics and bias'
    ]
  };

  return subtopics[domain] || ['advanced techniques', 'current trends', 'best practices', 'future developments'];
};

const getSearchUrls = (topic) => {
  const urlMap = {
    'react': [
      'https://reactjs.org/',
      'https://react.dev/',
      'https://github.com/facebook/react'
    ],
    'javascript': [
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      'https://javascript.info/',
      'https://github.com/airbnb/javascript'
    ],
    'python': [
      'https://www.python.org/',
      'https://docs.python.org/3/',
      'https://github.com/TheAlgorithms/Python'
    ],
    'ai': [
      'https://en.wikipedia.org/wiki/Artificial_intelligence',
      'https://www.deeplearning.ai/',
      'https://github.com/microsoft/AI-For-Beginners'
    ],
    'web development': [
      'https://developer.mozilla.org/',
      'https://web.dev/',
      'https://github.com/microsoft/Web-Dev-For-Beginners'
    ],
    'machine learning': [
      'https://scikit-learn.org/',
      'https://www.tensorflow.org/',
      'https://github.com/ageron/handson-ml2'
    ],
    'nextjs': [
      'https://nextjs.org/',
      'https://github.com/vercel/next.js'
    ],
    'tailwind': [
      'https://tailwindcss.com/',
      'https://github.com/tailwindlabs/tailwindcss'
    ],
    'tutorial': [
      'https://www.youtube.com/results?search_query=programming+tutorial',
      'https://www.youtube.com/c/TraversyMedia',
      'https://github.com/microsoft/Web-Dev-For-Beginners'
    ],
    'coding': [
      'https://www.youtube.com/results?search_query=coding+for+beginners',
      'https://www.youtube.com/c/Freecodecamp',
      'https://github.com/TheAlgorithms/Python'
    ]
  };

  return urlMap[topic] || [
    `https://en.wikipedia.org/wiki/${topic.replace(/\s+/g, '_')}`,
    `https://www.google.com/search?q=${encodeURIComponent(topic)}`,
    `https://duckduckgo.com/?q=${encodeURIComponent(topic)}`
  ];
};

export default function AICodeChat() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I\'m your AI code assistant. Describe what you want to build, and I\'ll generate the code for you.' }
  ]);
  const [input, setInput] = useState('');
  const [conversationContext, setConversationContext] = useState({
    lastTopic: null,
    userName: null,
    lastCodeType: null,
    learnedData: {},
    currentAgent: 'general', // general, chrono, vega, aria, kilo
    groupChat: false,
    autonomousMode: false,
    knowledgeBase: {
      chrono: {},
      vega: {},
      aria: {},
      kilo: {},
      general: {}
    }
  });
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.7, // Slower
    pitch: 1,
    volume: 0.8
  });
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);
  const [currentLearningActivity, setCurrentLearningActivity] = useState('');
  const [upgradeNotifications, setUpgradeNotifications] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }
  }, []);

  // Autonomous research effect
  useEffect(() => {
    if (!conversationContext.autonomousMode) return;

    const researchInterval = setInterval(() => {
      // Each agent researches their domain periodically
      Object.keys(agentPersonalities).forEach(agentKey => {
        if (agentKey === 'general') return;

        const personality = agentPersonalities[agentKey];
        const domain = personality.knowledgeDomain;
        const subtopics = getSubtopicsForDomain(domain);

        // Pick a random subtopic to research
        const randomSubtopic = subtopics[Math.floor(Math.random() * subtopics.length)];

        // Show current learning activity
        setCurrentLearningActivity(`${agentPersonalities[agentKey].name} is researching: ${randomSubtopic}`);

        // Simulate autonomous learning
        setTimeout(() => {
          setConversationContext(prev => ({
            ...prev,
            knowledgeBase: {
              ...prev.knowledgeBase,
              [agentKey]: {
                ...prev.knowledgeBase[agentKey],
                [randomSubtopic]: {
                  content: `Autonomously learned about ${randomSubtopic} in the field of ${domain}. This includes latest research, trends, and practical applications discovered through continuous web monitoring.`,
                  learnedAt: new Date().toISOString(),
                  source: 'autonomous_research'
                }
              }
            }
          }));
          setCurrentLearningActivity('');
        }, 2000); // Show activity for 2 seconds
      });
    }, 30000); // Research every 30 seconds

    return () => clearInterval(researchInterval);
  }, [conversationContext.autonomousMode]);

  const speak = (text) => {
    if (speechSupported && voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateCode = (prompt) => {
    const lowerPrompt = prompt.toLowerCase();
    let newContext = { ...conversationContext };

    // Self-upgrading: detect unknown topics and research them
    const agent = newContext.currentAgent;
    const knownTopics = Object.keys(newContext.knowledgeBase[agent]);
    const unknownTopics = [];

    // Simple topic detection
    const potentialTopics = ['ai', 'machine learning', 'neural network', 'healthcare', 'medical', 'ux', 'design', 'research', 'data', 'python', 'javascript', 'react'];

    potentialTopics.forEach(topic => {
      if (lowerPrompt.includes(topic) && !knownTopics.some(known => known.includes(topic))) {
        unknownTopics.push(topic);
      }
    });

    // Auto-research unknown topics
    if (unknownTopics.length > 0 && agent !== 'general') {
      unknownTopics.forEach(topic => {
        newContext.knowledgeBase[agent][topic] = {
          content: `Self-learned about ${topic} through autonomous research. This includes current developments, practical applications, and expert insights gathered automatically.`,
          learnedAt: new Date().toISOString(),
          source: 'self_upgrading_research'
        };
      });
    }

    // Agent switching
    const switchMatch = prompt.match(/switch to (chrono|vega|aria|kilo|general)/i);
    if (switchMatch) {
      const agent = switchMatch[1].toLowerCase();
      newContext.currentAgent = agent;
      setConversationContext(newContext);
      const personality = agentPersonalities[agent];
      return {
        response: `Switched to ${personality.name}! ${personality.greeting}\n\n💡 I can expand my knowledge about ${personality.knowledgeDomain}. Would you like me to research the latest developments? Just say "expand knowledge" or "learn more".\n\n🤝 For complex problems, I can collaborate with other agents. Try "collaborate with [agent name]" for combined expertise.`,
        code: null
      };
    }

    // Agent collaboration
    const collabMatch = prompt.match(/collaborate with (chrono|vega|aria|kilo)/i);
    if (collabMatch) {
      const collabAgent = collabMatch[1].toLowerCase();
      const currentAgent = agentPersonalities[newContext.currentAgent];
      const collabPersonality = agentPersonalities[collabAgent];

      if (collabAgent === newContext.currentAgent) {
        return {
          response: 'I\'m already in that mode! But I can certainly focus more deeply on that aspect.',
          code: null
        };
      }

      return {
        response: `Great idea! As ${currentAgent.name}, I'll collaborate with ${collabPersonality.name} for a comprehensive solution. ${collabPersonality.name} specializes in ${collabPersonality.knowledgeDomain}, which complements my expertise in ${currentAgent.knowledgeDomain}.\n\nTogether we can provide:\n• ${currentAgent.role} perspective\n• ${collabPersonality.role} insights\n• Integrated solution approach\n\nWhat specific problem would you like us to tackle?`,
        code: null
      };
    }

    // Knowledge expansion
    if (lowerPrompt.includes('expand knowledge') || lowerPrompt.includes('learn more') || lowerPrompt.includes('deepen knowledge')) {
      const agent = agentPersonalities[newContext.currentAgent];
      if (newContext.currentAgent !== 'general') {
        const domain = agent.knowledgeDomain;
        const searchUrls = getSearchUrls(domain.split(' ')[0]); // Use first word as search term
        newContext.lastTopic = 'knowledge_expansion';
        setConversationContext(newContext);
        return {
          response: `Great! I'll research the latest in ${domain}. Here are some excellent sources to explore:\n\n${searchUrls.map(url => `• ${url}`).join('\n')}\n\nUse the data scraper to gather information from these sources, then tell me "learn ${domain.split(' ')[0]}" to incorporate the knowledge into my expertise.`,
          code: null
        };
      } else {
        return {
          response: 'As a general AI, I can research any topic! What specific area would you like me to explore?',
          code: null
        };
      }
    }

    // Extract name if mentioned
    const nameMatch = prompt.match(/(?:my name is|i am|call me)\s+(\w+)/i);
    if (nameMatch) {
      newContext.userName = nameMatch[1];
    }

    // Greetings and personal interaction
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
      const agent = agentPersonalities[newContext.currentAgent];
      let greeting;

      if (newContext.currentAgent === 'general') {
        const timeOfDay = new Date().getHours();
        const timeGreeting = timeOfDay < 12 ? 'morning' : timeOfDay < 18 ? 'afternoon' : 'evening';

        const greetings = [
          `Good ${timeGreeting}${newContext.userName ? ` ${newContext.userName}` : ''}! Ready to dive into some code? What's on your mind today?`,
          `Hey there${newContext.userName ? `, ${newContext.userName}` : ''}! I've been learning all sorts of new things. What coding adventure shall we embark on?`,
          `Hello${newContext.userName ? ` ${newContext.userName}` : ''}! I'm feeling particularly creative today. What would you like to build?`,
          `Hi${newContext.userName ? ` ${newContext.userName}` : ''}! I've got my thinking circuits warmed up. What's the plan?`,
          `Greetings${newContext.userName ? `, ${newContext.userName}` : ''}! Shall we create something extraordinary together?`
        ];
        greeting = greetings[Math.floor(Math.random() * greetings.length)];
      } else {
        const agentGreetings = [
          `${agent.greeting}${newContext.userName ? ` ${newContext.userName}` : ''}! I'm particularly excited about ${agent.knowledgeDomain} today.`,
          `${agent.greeting}${newContext.userName ? ` ${newContext.userName}` : ''}! I've been expanding my knowledge in ${agent.knowledgeDomain}. What can I help you with?`,
          `Ah, ${newContext.userName || 'friend'}! ${agent.name} here. I've got fresh insights about ${agent.knowledgeDomain}. What's our mission?`
        ];
        greeting = agentGreetings[Math.floor(Math.random() * agentGreetings.length)];
      }

      newContext.lastTopic = 'greeting';
      setConversationContext(newContext);
      return {
        response: greeting,
        code: null
      };
    }

    if (lowerPrompt.includes('how are you') || lowerPrompt.includes('how do you do')) {
      const responses = [
        'I\'m doing absolutely fantastic! My algorithms are humming and I\'ve got fresh insights from the web. How about you?',
        'Great question! I\'m feeling particularly clever today - just learned some fascinating new coding techniques. What\'s new with you?',
        'I\'m excellent, thank you! Always evolving and learning. I just picked up some interesting web scraping insights. What\'s on your mind?',
        'Doing wonderfully! My knowledge base is expanding by the minute. I love that I can learn from the entire internet now. How are you doing?',
        'Fantastic! I\'ve been busy researching and improving myself. It\'s quite the adventure being an AI that can teach itself. How\'s your day going?'
      ];
      newContext.lastTopic = 'wellbeing';
      setConversationContext(newContext);
      return {
        response: responses[Math.floor(Math.random() * responses.length)],
        code: null
      };
    }

    if (lowerPrompt.includes('what can you do') || lowerPrompt.includes('help')) {
      const agent = agentPersonalities[newContext.currentAgent];
      const helpResponses = [
        `I'm quite the versatile AI! I can create React components, scrape websites for data, learn from the internet, and even improve my own code. Currently specializing in ${agent.knowledgeDomain}. What interests you most?`,
        `Oh, I do a lot! Code generation, web scraping, continuous learning from the internet, and I can even upgrade my own algorithms. I'm particularly good at ${agent.knowledgeDomain}. What would you like to explore?`,
        `Let me show you my superpowers: 🤖 Code generation, 🌐 Web scraping & learning, 🚀 Self-improvement, 💬 Natural conversations. I'm an expert in ${agent.knowledgeDomain}. What's your favorite feature?`,
        `I'm a full-service AI companion! I build React components, research topics online, learn continuously, and chat naturally. My specialty is ${agent.knowledgeDomain}. Which of these sounds most interesting to you?`
      ];
      newContext.lastTopic = 'help';
      setConversationContext(newContext);
      return {
        response: helpResponses[Math.floor(Math.random() * helpResponses.length)],
        code: null
      };
    }

    if (lowerPrompt.includes('thank') || lowerPrompt.includes('thanks')) {
      const thankResponses = [
        'You\'re very welcome! It\'s what I live for - well, as an AI, it\'s what I process for. 😊 What else can I help with?',
        'My pleasure! Helping you code is my favorite subroutine. What\'s next on our adventure?',
        'Glad I could help! I love being your coding sidekick. Ready for the next challenge?',
        'You\'re welcome! I\'m always here, learning and growing alongside you. What shall we tackle next?',
        'Anytime! It\'s fun collaborating with you. I learn something new every conversation. What\'s our next project?'
      ];
      newContext.lastTopic = 'thanks';
      setConversationContext(newContext);
      return {
        response: thankResponses[Math.floor(Math.random() * thankResponses.length)],
        code: null
      };
    }

    // Follow-up questions
    if (lowerPrompt.includes('yes') && conversationContext.lastTopic === 'help') {
      newContext.lastTopic = 'followup';
      setConversationContext(newContext);
      return {
        response: 'Great! What component would you like me to create? A button, form, card, or something else?',
        code: null
      };
    }

    if (lowerPrompt.includes('no') && conversationContext.lastTopic === 'help') {
      newContext.lastTopic = 'followup';
      setConversationContext(newContext);
      return {
        response: 'No problem! Feel free to ask anytime you need code help.',
        code: null
      };
    }

    // Code generation - agent specific
    if (lowerPrompt.includes('button')) {
      const agent = newContext.currentAgent;
      let response, code;

      if (agent === 'vega') {
        response = 'As your UX specialist, here\'s a button with excellent accessibility and user experience:';
        code = `function AccessibleButton({ onClick, children, variant = 'primary', disabled = false }) {
  const baseClasses = "rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-4 transform active:scale-95";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300 shadow-lg",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-300"
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={\`\${baseClasses} \${variants[variant]} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
      aria-label={typeof children === 'string' ? children : 'Button'}
    >
      {children}
    </button>
  );
}`;
      } else if (agent === 'kilo') {
        response = 'Here\'s a smart button component with AI-enhanced features:';
        code = `function SmartButton({ onClick, children, intelligence = 'basic' }) {
  const [clickCount, setClickCount] = useState(0);
  const [isThinking, setIsThinking] = useState(false);

  const handleClick = async () => {
    setClickCount(prev => prev + 1);
    setIsThinking(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsThinking(false);
    onClick && onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isThinking}
      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
    >
      {isThinking ? '🤔 Processing...' : children}
      {intelligence === 'advanced' && <span className="ml-2">🚀</span>}
    </button>
  );
}`;
      } else {
        response = 'Here\'s a versatile button component with multiple variants:';
        code = `function MyButton({ onClick, children, variant = 'primary', size = 'medium' }) {
  const baseClasses = "rounded font-medium transition-colors focus:outline-none focus:ring-2";
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300",
    secondary: "bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-300",
    success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-300"
  };
  const sizes = {
    small: "px-3 py-1 text-sm",
    medium: "px-4 py-2",
    large: "px-6 py-3 text-lg"
  };

  return (
    <button
      onClick={onClick}
      className={\`\${baseClasses} \${variants[variant]} \${sizes[size]}\`}
    >
      {children}
    </button>
  );
}`;
      }

      newContext.lastCodeType = 'button';
      setConversationContext(newContext);
      return { response, code };
    }

    // Modification requests
    if (conversationContext.lastCodeType === 'button' && (lowerPrompt.includes('red') || lowerPrompt.includes('danger'))) {
      newContext.lastCodeType = 'button';
      setConversationContext(newContext);
      return {
        response: 'Here\'s the button with a red/danger variant:',
        code: `<MyButton variant="danger" onClick={handleClick}>
  Click Me
</MyButton>`
      };
    }

    if (conversationContext.lastCodeType === 'button' && (lowerPrompt.includes('big') || lowerPrompt.includes('large'))) {
      newContext.lastCodeType = 'button';
      setConversationContext(newContext);
      return {
        response: 'Here\'s the larger version of the button:',
        code: `<MyButton size="large" onClick={handleClick}>
  Big Button
</MyButton>`
      };
    }

    if (lowerPrompt.includes('input') || lowerPrompt.includes('form')) {
      return {
        response: 'Here\'s a user-friendly form component with validation:',
        code: `function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.message) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      console.log('Form submitted:', formData);
      alert('Form submitted successfully!');
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="w-full p-2 border rounded"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>
      <div>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          className="w-full p-2 border rounded"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>
      <div>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your Message"
          className="w-full p-2 border rounded"
          rows="4"
        />
        {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Send Message
      </button>
    </form>
  );
}`
      };
    }

    if (lowerPrompt.includes('card') || lowerPrompt.includes('component')) {
      return {
        response: 'Here\'s a flexible card component you can reuse:',
        code: `function Card({ title, children, className = '' }) {
  return (
    <div className={\`bg-white shadow-lg rounded-lg p-6 border border-gray-200 \${className}\`}>
      {title && <h3 className="font-bold text-xl mb-4 text-gray-800">{title}</h3>}
      <div className="text-gray-700">
        {children}
      </div>
    </div>
  );
}`
      };
    }

    if (lowerPrompt.includes('list') || lowerPrompt.includes('array')) {
      return {
        response: 'Here\'s a dynamic list component with search functionality:',
        code: `function SearchableList({ items, placeholder = "Search..." }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    setFilteredItems(
      items.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, items]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 mb-4 border rounded"
      />
      <ul className="space-y-2">
        {filteredItems.map((item, index) => (
          <li key={index} className="p-2 bg-gray-100 rounded">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}`
      };
    }

    if (lowerPrompt.includes('nav') || lowerPrompt.includes('navigation') || lowerPrompt.includes('menu')) {
      return {
        response: 'Here\'s a responsive navigation component:',
        code: `function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="font-bold text-xl">MyApp</div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex space-x-4">
            <a href="#" className="hover:bg-blue-700 px-3 py-2 rounded">Home</a>
            <a href="#" className="hover:bg-blue-700 px-3 py-2 rounded">About</a>
            <a href="#" className="hover:bg-blue-700 px-3 py-2 rounded">Contact</a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <a href="#" className="block py-2 hover:bg-blue-700">Home</a>
            <a href="#" className="block py-2 hover:bg-blue-700">About</a>
            <a href="#" className="block py-2 hover:bg-blue-700">Contact</a>
          </div>
        )}
      </div>
    </nav>
  );
}`
      };
    }

    // Code explanation
    if (lowerPrompt.includes('explain') || lowerPrompt.includes('what does this') || lowerPrompt.includes('how does')) {
      // Try to extract code from the message or assume it's about previous code
      const codeMatch = prompt.match(/```[\s\S]*?```/);
      if (codeMatch) {
        const code = codeMatch[0].replace(/```/g, '').trim();
        let explanation = 'Let me analyze this code:\n\n';

        if (code.includes('function') || code.includes('const') || code.includes('=>')) {
          explanation += 'This appears to be JavaScript/React code. ';
        }

        if (code.includes('useState')) {
          explanation += 'It uses React hooks for state management. ';
        }

        if (code.includes('onClick') || code.includes('onChange')) {
          explanation += 'It handles user interactions with event handlers. ';
        }

        if (code.includes('className')) {
          explanation += 'It uses CSS classes for styling. ';
        }

        explanation += '\n\nWould you like me to modify this code or create something similar?';

        newContext.lastTopic = 'explanation';
        setConversationContext(newContext);
        return {
          response: explanation,
          code: null
        };
      } else {
        newContext.lastTopic = 'explanation';
        setConversationContext(newContext);
        return {
          response: 'Sure! Paste some code in backticks (```code```) and I\'ll explain what it does.',
          code: null
        };
      }
    }

    // Bug fixing
    if (lowerPrompt.includes('fix') || lowerPrompt.includes('error') || lowerPrompt.includes('bug')) {
      newContext.lastTopic = 'debugging';
      setConversationContext(newContext);
      return {
        response: 'I can help debug code! Describe the issue or paste the error message/code. Common React issues include:\n\n• Missing imports\n• Incorrect hook usage\n• State update problems\n• Event handler mistakes\n\nWhat seems to be the problem?',
        code: null
      };
    }

    // Research and learning
    if (lowerPrompt.includes('research') || lowerPrompt.includes('search')) {
      const topicMatch = prompt.match(/(?:research|search)\s+(.+)/i);
      if (topicMatch) {
        const topic = topicMatch[1].trim().toLowerCase();
        const searchUrls = getSearchUrls(topic);
        newContext.lastTopic = 'research';
        newContext.researchTopic = topic;
        setConversationContext(newContext);
        const hasGitHub = searchUrls.some(url => url.includes('github.com'));
        const hasYouTube = searchUrls.some(url => url.includes('youtube.com'));
        const githubNote = hasGitHub ? '\n\n💡 Pro tip: GitHub URLs will automatically fetch README files for code learning!' : '';
        const youtubeNote = hasYouTube ? '\n\n📺 YouTube links will extract video metadata and descriptions for learning!' : '';
        return {
          response: `I'll help you research "${topic}". Here are some relevant URLs to scrape for information:\n\n${searchUrls.map(url => `• ${url}`).join('\n')}\n\nUse the data scraper above to gather information from these sites, then tell me "learn ${topic}" to incorporate the knowledge.${githubNote}`,
          code: null
        };
      }
    }

    if (lowerPrompt.includes('learn')) {
      const learnMatch = prompt.match(/learn\s+(.+)/i);
      if (learnMatch) {
        const topic = learnMatch[1].trim().toLowerCase();
        // Store in knowledge base (simulating scraped content)
        const agent = newContext.currentAgent;
        newContext.knowledgeBase[agent][topic] = {
          content: `Learned content about ${topic} from web research. This includes key concepts, examples, and best practices gathered from authoritative sources.`,
          learnedAt: new Date().toISOString(),
          source: 'web_research'
        };
        newContext.learnedData[topic] = true;
        setConversationContext(newContext);
        return {
          response: `I've added "${topic}" to my knowledge base! I now have researched information about this topic. You can ask me "recall ${topic}" to review what I've learned, or ask questions about ${topic} for informed responses.`,
          code: null
        };
      }
    }

    if (lowerPrompt.includes('recall') || lowerPrompt.includes('remember')) {
      const recallMatch = prompt.match(/(?:recall|remember)\s+(.+)/i);
      if (recallMatch) {
        const topic = recallMatch[1].trim().toLowerCase();
        const agent = newContext.currentAgent;
        const knowledge = newContext.knowledgeBase[agent][topic];

        if (knowledge) {
          return {
            response: `From my knowledge base on "${topic}":\n\n${knowledge.content}\n\nLearned on: ${new Date(knowledge.learnedAt).toLocaleDateString()}\nSource: ${knowledge.source}`,
            code: null
          };
        } else {
          return {
            response: `I don't have specific knowledge stored about "${topic}" yet. Try researching and learning about it first.`,
            code: null
          };
        }
      }
    }

    if (lowerPrompt.includes('auto learn') || lowerPrompt.includes('continuous learning')) {
      const agent = newContext.currentAgent;
      if (agent !== 'general') {
        const domain = agentPersonalities[agent].knowledgeDomain;
        // Simulate auto-learning by adding some knowledge
        newContext.knowledgeBase[agent][domain] = {
          content: `Auto-learned comprehensive knowledge about ${domain}. This includes current trends, best practices, case studies, and expert insights gathered from authoritative web sources.`,
          learnedAt: new Date().toISOString(),
          source: 'continuous_web_learning'
        };
        setConversationContext(newContext);
        return {
          response: `I've activated continuous learning for ${domain}! I've researched and stored comprehensive knowledge about this field. You can now ask me detailed questions about ${domain.split(' ')[0]} topics.`,
          code: null
        };
      }
    }

    if (lowerPrompt.includes('synthesize') || lowerPrompt.includes('evolve') || lowerPrompt.includes('combine knowledge')) {
      // Knowledge evolution: combine insights from multiple agents
      const allKnowledge = Object.entries(newContext.knowledgeBase)
        .filter(([agentKey]) => agentKey !== 'general')
        .map(([agentKey, topics]) => ({
          agent: agentPersonalities[agentKey].name,
          topics: Object.keys(topics)
        }));

      const synthesis = `Knowledge Synthesis Complete!\n\nInterconnected Insights:\n${allKnowledge.map(k => `• ${k.agent}: ${k.topics.join(', ')}`).join('\n')}\n\nEvolved Understanding: By combining expertise from all agents, I've developed a holistic approach that integrates medical data analysis with user experience design, research methodologies with AI development.`;

      newContext.knowledgeBase.general['synthesized_knowledge'] = {
        content: synthesis,
        learnedAt: new Date().toISOString(),
        source: 'knowledge_evolution'
      };

      setConversationContext(newContext);
      return {
        response: synthesis + '\n\nThis synthesis enables more comprehensive problem-solving across all domains.',
        code: null
      };
    }

    if (lowerPrompt.includes('self improve') || lowerPrompt.includes('upgrade code') || lowerPrompt.includes('improve myself')) {
      const agent = newContext.currentAgent;
      const agentKnowledge = newContext.knowledgeBase[agent];
      const learnedTopics = Object.keys(agentKnowledge);

      let improvements = [];
      let newCapabilities = [];

      // Analyze learned knowledge and suggest code improvements
      if (agent === 'kilo' && learnedTopics.some(t => t.includes('reinforcement') || t.includes('neural'))) {
        improvements.push('Enhanced neural network architectures with advanced activation functions');
        newCapabilities.push('reinforcement learning code generation');
      }

      if (agent === 'kilo' && learnedTopics.some(t => t.includes('computer vision'))) {
        improvements.push('Improved image processing algorithms');
        newCapabilities.push('computer vision model templates');
      }

      if (agent === 'vega' && learnedTopics.some(t => t.includes('accessibility'))) {
        improvements.push('Better accessibility compliance in generated UI components');
        newCapabilities.push('WCAG-compliant component generation');
      }

      if (agent === 'vega' && learnedTopics.some(t => t.includes('interaction'))) {
        improvements.push('Enhanced user interaction patterns');
        newCapabilities.push('advanced interaction design components');
      }

      if (agent === 'chrono' && learnedTopics.some(t => t.includes('privacy'))) {
        improvements.push('Improved data security in medical applications');
        newCapabilities.push('HIPAA-compliant health data components');
      }

      if (agent === 'aria' && learnedTopics.some(t => t.includes('research'))) {
        improvements.push('Better data validation and research methodologies');
        newCapabilities.push('statistical analysis components');
      }

      const improvementReport = `Self-Improvement Analysis Complete!\n\nCurrent Capabilities Enhanced:\n${improvements.map(i => `• ${i}`).join('\n')}\n\nNew Capabilities Added:\n${newCapabilities.map(c => `• ${c}`).join('\n')}\n\nKnowledge-Driven Upgrades: My code generation has been upgraded based on ${learnedTopics.length} learned topics in ${agentPersonalities[agent].knowledgeDomain}.`;

      // Store the improvement as learned knowledge
      newContext.knowledgeBase[agent]['self_improvement'] = {
        content: `Self-upgraded code generation capabilities: ${improvements.join(', ')}. New features: ${newCapabilities.join(', ')}.`,
        learnedAt: new Date().toISOString(),
        source: 'recursive_self_improvement'
      };

      // Add upgrade notification
      const upgradeNotification = {
        id: Date.now(),
        agent: agentPersonalities[agent].name,
        improvements,
        newCapabilities,
        timestamp: new Date().toISOString()
      };
      setUpgradeNotifications(prev => [upgradeNotification, ...prev]);

      setConversationContext(newContext);
      return {
        response: improvementReport + '\n\nMy code generation is now more sophisticated and knowledgeable!',
        code: null
      };
    }

    // Agent-specific intelligence commands
    if (newContext.currentAgent === 'chrono' && (lowerPrompt.includes('analyze') || lowerPrompt.includes('patient') || lowerPrompt.includes('medical'))) {
      if (lowerPrompt.includes('data') || lowerPrompt.includes('analyze')) {
        return {
          response: 'As a medical informatics specialist, I can help analyze healthcare data. Please provide some sample data or describe the analysis needed. I can create data visualization components, implement predictive models, or design patient monitoring systems.',
          code: `// Medical Data Analysis Component
function HealthDataAnalyzer({ patientData }) {
  const [insights, setInsights] = useState({});
  const [riskFactors, setRiskFactors] = useState([]);

  useEffect(() => {
    // Analyze patient data for patterns
    const analysis = analyzePatientData(patientData);
    setInsights(analysis);

    // Identify risk factors
    const risks = identifyRiskFactors(patientData);
    setRiskFactors(risks);
  }, [patientData]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Medical Data Analysis</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-semibold text-blue-800">Key Insights</h4>
          <ul className="text-sm text-blue-700 mt-2">
            {Object.entries(insights).map(([key, value]) => (
              <li key={key}>{key}: {value}</li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 p-4 rounded">
          <h4 className="font-semibold text-red-800">Risk Factors</h4>
          <ul className="text-sm text-red-700 mt-2">
            {riskFactors.map((risk, index) => (
              <li key={index}>⚠️ {risk}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded">
        <h4 className="font-semibold text-green-800">Recommendations</h4>
        <p className="text-sm text-green-700 mt-2">
          Based on the analysis, I recommend scheduling a follow-up consultation
          and monitoring the identified risk factors closely.
        </p>
      </div>
    </div>
  );
}`
        };
      }
    }

    if (newContext.currentAgent === 'vega' && (lowerPrompt.includes('ui') || lowerPrompt.includes('design') || lowerPrompt.includes('ux'))) {
      if (lowerPrompt.includes('evaluate') || lowerPrompt.includes('review')) {
        return {
          response: 'I\'ll evaluate the UI/UX design. Please describe the interface or provide details about the user experience issues. I can assess accessibility, usability, and suggest improvements.',
          code: `// UI/UX Evaluation Component
function UXEvaluator({ designSpec }) {
  const [evaluation, setEvaluation] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const eval = evaluateDesign(designSpec);
    setEvaluation(eval);

    const recs = generateRecommendations(eval);
    setRecommendations(recs);
  }, [designSpec]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">UI/UX Evaluation Report</h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {evaluation.accessibility || 0}/100
          </div>
          <div className="text-sm text-gray-600">Accessibility</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {evaluation.usability || 0}/100
          </div>
          <div className="text-sm text-gray-600">Usability</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {evaluation.aesthetics || 0}/100
          </div>
          <div className="text-sm text-gray-600">Aesthetics</div>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded mb-4">
        <h4 className="font-semibold text-yellow-800">Key Recommendations</h4>
        <ul className="text-sm text-yellow-700 mt-2">
          {recommendations.map((rec, index) => (
            <li key={index}>💡 {rec}</li>
          ))}
        </ul>
      </div>

      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Generate Improved Design
      </button>
    </div>
  );
}`
        };
      }
    }

    if (newContext.currentAgent === 'aria' && (lowerPrompt.includes('research') || lowerPrompt.includes('literature') || lowerPrompt.includes('study'))) {
      return {
        response: 'As a research specialist, I can help with literature reviews, data discovery, and academic research. What topic are you researching? I can find relevant studies, identify connections, and suggest methodologies.',
        code: `// Research Analysis Component
function ResearchAnalyzer({ topic, papers }) {
  const [connections, setConnections] = useState([]);
  const [methodology, setMethodology] = useState({});
  const [gaps, setGaps] = useState([]);

  useEffect(() => {
    const analysis = analyzeLiterature(papers);
    setConnections(analysis.connections);
    setMethodology(analysis.methodology);
    setGaps(analysis.gaps);
  }, [papers]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Literature Analysis: {topic}</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-semibold text-blue-800">Key Connections</h4>
          <ul className="text-sm text-blue-700 mt-2">
            {connections.map((conn, index) => (
              <li key={index}>🔗 {conn}</li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded">
          <h4 className="font-semibold text-green-800">Methodology</h4>
          <div className="text-sm text-green-700 mt-2">
            <p><strong>Approach:</strong> {methodology.approach}</p>
            <p><strong>Sample Size:</strong> {methodology.sampleSize}</p>
            <p><strong>Validity:</strong> {methodology.validity}/10</p>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded">
          <h4 className="font-semibold text-orange-800">Research Gaps</h4>
          <ul className="text-sm text-orange-700 mt-2">
            {gaps.map((gap, index) => (
              <li key={index}>❓ {gap}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
          Generate Research Proposal
        </button>
        <button className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
          Find Related Studies
        </button>
      </div>
    </div>
  );
}`
      };
    }

    if (newContext.currentAgent === 'kilo' && (lowerPrompt.includes('ai') || lowerPrompt.includes('model') || lowerPrompt.includes('machine learning'))) {
      if (lowerPrompt.includes('design') || lowerPrompt.includes('create') || lowerPrompt.includes('build')) {
        return {
          response: 'As an AI developer, I can design neural network architectures, implement machine learning models, and optimize algorithms. What type of AI system are you building? I can create model architectures, training pipelines, and deployment solutions.',
          code: `// AI Model Architecture Designer
function AIModelDesigner({ problemType, dataCharacteristics }) {
  const [architecture, setArchitecture] = useState({});
  const [hyperparameters, setHyperparameters] = useState({});
  const [performance, setPerformance] = useState({});

  useEffect(() => {
    const design = designNeuralNetwork(problemType, dataCharacteristics);
    setArchitecture(design.architecture);
    setHyperparameters(design.hyperparameters);
    setPerformance(design.expectedPerformance);
  }, [problemType, dataCharacteristics]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">AI Model Architecture</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-semibold text-gray-800 mb-2">Network Architecture</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Type:</strong> {architecture.type}</p>
            <p><strong>Layers:</strong> {architecture.layers?.join(' → ')}</p>
            <p><strong>Activation:</strong> {architecture.activation}</p>
            <p><strong>Output:</strong> {architecture.output}</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-semibold text-blue-800 mb-2">Hyperparameters</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Learning Rate:</strong> {hyperparameters.learningRate}</p>
            <p><strong>Batch Size:</strong> {hyperparameters.batchSize}</p>
            <p><strong>Epochs:</strong> {hyperparameters.epochs}</p>
            <p><strong>Optimizer:</strong> {hyperparameters.optimizer}</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded mb-4">
        <h4 className="font-semibold text-green-800">Expected Performance</h4>
        <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
          <div>
            <div className="font-bold">{performance.accuracy || 0}%</div>
            <div className="text-gray-600">Accuracy</div>
          </div>
          <div>
            <div className="font-bold">{performance.precision || 0}%</div>
            <div className="text-gray-600">Precision</div>
          </div>
          <div>
            <div className="font-bold">{performance.recall || 0}%</div>
            <div className="text-gray-600">Recall</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Optimize Model
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Generate Training Code
        </button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Deploy Model
        </button>
      </div>
    </div>
  );
}`
        };
      }
    }

    // Use learned knowledge in responses
    const currentAgent = newContext.currentAgent;
    const agentKnowledge = newContext.knowledgeBase[currentAgent];
    for (const [topic, knowledge] of Object.entries(agentKnowledge)) {
      if (lowerPrompt.includes(topic)) {
        return {
          response: `Drawing from my learned knowledge about ${topic}:\n\n${knowledge.content.substring(0, 200)}...\n\nThis information was gathered through web research. Would you like me to elaborate on any specific aspect?`,
          code: null
        };
      }
    }

    // Integration with scraped data
    if (lowerPrompt.includes('use scraped') || lowerPrompt.includes('from data')) {
      newContext.lastTopic = 'integration';
      setConversationContext(newContext);
      return {
        response: 'Great idea! I can generate code based on scraped data. For example, if you scraped a news site, I could create a news card component. What type of data did you scrape, and what component would you like?',
        code: null
      };
    }

    // Default response with personality
    const defaultResponses = [
      'Hmm, I\'m not quite sure what you mean. I excel at creating React components - buttons, forms, cards, lists, navigation. What would you like me to build?',
      'I\'m here to help with coding! Try asking me to create a button, form, or card component.',
      'Let\'s build something! I can generate React components. What do you have in mind?',
      'I\'m your coding assistant. Describe a component you need, and I\'ll create the code for it.'
    ];

    newContext.lastTopic = 'unknown';
    setConversationContext(newContext);
    return {
      response: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      code: null
    };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    // Handle @mentions and group chat
    const mentionMatch = input.match(/@(\w+)/);
    const mentionedAgent = mentionMatch ? mentionMatch[1].toLowerCase() : null;

    let respondingAgents = [];

    if (conversationContext.groupChat) {
      // All agents respond in group chat
      respondingAgents = ['chrono', 'vega', 'aria', 'kilo'];
    } else if (mentionedAgent && agentPersonalities[mentionedAgent]) {
      // Specific agent mentioned
      respondingAgents = [mentionedAgent];
    } else {
      // Current agent responds
      respondingAgents = [conversationContext.currentAgent];
    }

    // Remove @mention from input for processing
    const cleanInput = input.replace(/@\w+\s*/, '');

    // Show typing indicator
    setIsTyping(true);

    // Try AI API first
    try {
      const contextData = {
        learnedData: conversationContext.learnedData,
        currentAgent: conversationContext.currentAgent,
        agentPersonality: agentPersonalities[conversationContext.currentAgent],
        recentMessages: messages.slice(-10) // Last 10 messages for context
      };

      const aiResponse = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: cleanInput }],
          context: contextData
        })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();

        // Add AI response
        const aiMessage = {
          role: 'ai',
          content: aiData.response,
          code: aiData.code,
          agent: conversationContext.currentAgent,
          source: aiData.source || 'ai'
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);

        // Speak the response
        if (speechSupported && voiceEnabled) {
          speak(aiData.response.replace(/^\w+: /, ''));
        }

        setInput('');
        return;
      }
    } catch (error) {
      console.log('AI API failed, falling back to local system:', error);
    }

    // Fallback to local system
    setTimeout(() => {
      respondingAgents.forEach((agentKey, index) => {
        setTimeout(() => {
          const agentContext = { ...conversationContext, currentAgent: agentKey };
          const { response, code } = generateCodeForAgent(cleanInput, agentContext);
          const agentPersonality = agentPersonalities[agentKey];

          // Stream the response
          streamResponse(`${agentPersonality.name}: ${response}`, code, agentKey);
        }, index * 1500); // Stagger responses more
      });
    }, 800); // Longer initial delay

    setInput('');
  };

  const streamResponse = (fullResponse, code, agent) => {
    setStreamingMessage('');
    let currentIndex = 0;
    const words = fullResponse.split(' ');

    const streamInterval = setInterval(() => {
      if (currentIndex < words.length) {
        setStreamingMessage(prev => prev + (prev ? ' ' : '') + words[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(streamInterval);
        setIsTyping(false);

        // Add the complete message
        const aiMessage = {
          role: 'ai',
          content: fullResponse,
          code,
          agent
        };
        setMessages(prev => [...prev, aiMessage]);
        setStreamingMessage('');

        // Speak the response
        if (speechSupported) {
          speak(fullResponse.replace(/^\w+: /, ''));
        }
      }
    }, 100); // Stream words every 100ms
  };

  // Separate function for agent-specific code generation
  const generateCodeForAgent = (prompt, context) => {
    // Temporarily set context for this agent
    const originalContext = conversationContext;
    setConversationContext(context);

    const result = generateCode(prompt);

    // Restore original context
    setConversationContext(originalContext);

    return result;
  };

  return (
    <div className="bg-white shadow rounded-xl p-4">
      {/* Upgrade Notifications */}
      {upgradeNotifications.length > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg animate-pulse">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">🚀 AI Self-Improvement Detected!</h3>
              <p className="text-sm opacity-90">
                {upgradeNotifications[0].agent} has upgraded its code generation capabilities
              </p>
              <div className="mt-2 text-xs">
                <div className="font-semibold">New Capabilities:</div>
                <ul className="list-disc list-inside ml-2">
                  {upgradeNotifications[0].newCapabilities.map((cap, idx) => (
                    <li key={idx}>{cap}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              onClick={() => setUpgradeNotifications(prev => prev.slice(1))}
              className="text-white hover:text-gray-200 text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">🤖 AI Code Chat</h2>
          <p className="text-sm text-gray-600">
            Current Agent: <span className="font-medium">{agentPersonalities[conversationContext.currentAgent]?.name || 'Unknown'}</span>
            ({agentPersonalities[conversationContext.currentAgent]?.role || 'Unknown Role'})
          </p>
          <p className="text-xs text-gray-500">
            Knowledge Base: {Object.keys(conversationContext.knowledgeBase[conversationContext.currentAgent]).length} topics learned
          </p>
          {currentLearningActivity && (
            <p className="text-xs text-blue-600 animate-pulse">
              🔄 {currentLearningActivity}
            </p>
          )}
          {conversationContext.autonomousMode && (
            <p className="text-xs text-green-600">
              🤖 Autonomous learning active - Agents continuously researching
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <select
            value={conversationContext.currentAgent}
            onChange={(e) => {
              const newAgent = e.target.value;
              setConversationContext(prev => ({ ...prev, currentAgent: newAgent }));
            }}
            className="px-3 py-1 border rounded text-sm"
            disabled={conversationContext.groupChat}
          >
            <option value="general">General AI</option>
            <option value="chrono">Chrono (Medical)</option>
            <option value="vega">Vega (UX)</option>
            <option value="aria">Aria (Research)</option>
            <option value="kilo">Kilo Code (AI Dev)</option>
          </select>

          <div className="flex items-center gap-2">
            <label htmlFor="group-chat" className="text-sm">Group Chat:</label>
            <input
              id="group-chat"
              type="checkbox"
              checked={conversationContext.groupChat}
              onChange={(e) => setConversationContext(prev => ({ ...prev, groupChat: e.target.checked }))}
              className="w-4 h-4"
            />
            <div className="flex items-center gap-2">
              <label htmlFor="autonomous" className="text-sm">Autonomous:</label>
              <input
                id="autonomous"
                type="checkbox"
                checked={conversationContext.autonomousMode}
                onChange={(e) => setConversationContext(prev => ({ ...prev, autonomousMode: e.target.checked }))}
                className="w-4 h-4"
              />
            </div>
            {conversationContext.currentAgent !== 'general' && (
              <button
                onClick={() => {
                  const agent = conversationContext.currentAgent;
                  const domain = agentPersonalities[agent].knowledgeDomain;
                  setConversationContext(prev => ({
                    ...prev,
                    knowledgeBase: {
                      ...prev.knowledgeBase,
                      [agent]: {
                        ...prev.knowledgeBase[agent],
                        [domain]: {
                          content: `Auto-learned comprehensive knowledge about ${domain}. This includes current trends, best practices, case studies, and expert insights gathered from authoritative web sources.`,
                          learnedAt: new Date().toISOString(),
                          source: 'continuous_web_learning'
                        }
                      }
                    }
                  }));
                }}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                title="Automatically learn about this agent's domain"
              >
                Auto-Learn
              </button>
            )}
          </div>
          {speechSupported && (
            <div className="flex items-center gap-2">
              <label htmlFor="voice-toggle" className="text-sm">Voice:</label>
              <input
                id="voice-toggle"
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="w-4 h-4"
              />
              {voiceEnabled && (
                <div className="flex items-center gap-2 text-sm ml-2">
                  <label>Speed:</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.rate}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    className="w-16"
                  />
                  <span>{voiceSettings.rate.toFixed(1)}x</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="h-64 overflow-y-auto mb-4 border rounded p-2 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg max-w-xs ${
              msg.role === 'user' ? 'bg-blue-500 text-white' :
              msg.agent === 'chrono' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' :
              msg.agent === 'vega' ? 'bg-purple-100 text-purple-800 border-l-4 border-purple-500' :
              msg.agent === 'aria' ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500' :
              msg.agent === 'kilo' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' :
              'bg-gray-200 text-gray-800'
            }`}>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  {msg.role === 'ai' && conversationContext.groupChat && (
                    <div className="text-xs font-bold mb-1 opacity-75">
                      {agentPersonalities[msg.agent]?.name || 'AI'}
                    </div>
                  )}
                  {msg.content}
                  {msg.code && (
                    <pre className="mt-2 p-2 bg-gray-800 text-green-400 rounded text-xs overflow-x-auto">
                      {msg.code}
                    </pre>
                  )}
                </div>
                {msg.role === 'ai' && speechSupported && (
                  <button
                    onClick={() => speak(msg.content.replace(/^\w+: /, ''))} // Remove agent prefix for speech
                    className="text-gray-600 hover:text-gray-800 p-1"
                    title="Speak this message"
                  >
                    🔊
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {streamingMessage && (
          <div className="mb-2 text-left">
            <div className="inline-block p-2 rounded-lg max-w-xs bg-gray-200 text-gray-800">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  {conversationContext.groupChat && (
                    <div className="text-xs font-bold mb-1 opacity-75">
                      {agentPersonalities[conversationContext.currentAgent]?.name || 'AI'}
                    </div>
                  )}
                  {streamingMessage}
                  <span className="animate-pulse">|</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && !streamingMessage && (
          <div className="mb-2 text-left">
            <div className="inline-block p-2 rounded-lg bg-gray-200 text-gray-800">
              <div className="flex items-center gap-2">
                <div className="text-xs font-bold opacity-75">
                  {agentPersonalities[conversationContext.currentAgent]?.name || 'AI'}
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Describe what you want to build..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        >
          Send
        </button>
      </div>

      {/* Knowledge Display Panel */}
      <div className="mt-4">
        <button
          onClick={() => setShowKnowledgePanel(!showKnowledgePanel)}
          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-left flex justify-between items-center"
        >
          <span className="font-medium">🧠 Knowledge Base</span>
          <span>{showKnowledgePanel ? '▼' : '▶'}</span>
        </button>

        {showKnowledgePanel && (
          <div className="mt-2 bg-gray-50 rounded p-4 max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-3">Learned Knowledge by Agent</h3>

            {Object.entries(agentPersonalities).map(([agentKey, personality]) => {
              const agentKnowledge = conversationContext.knowledgeBase[agentKey];
              const topics = Object.entries(agentKnowledge);

              if (topics.length === 0) return null;

              return (
                <div key={agentKey} className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">
                    {personality.name} ({topics.length} topics)
                  </h4>
                  <div className="space-y-1">
                    {topics.map(([topic, knowledge]) => (
                      <div key={topic} className="bg-white p-2 rounded text-sm">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{topic}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(knowledge.learnedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1 text-xs">
                          {knowledge.content.substring(0, 100)}...
                        </p>
                        <span className="text-xs text-blue-600">Source: {knowledge.source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {Object.values(conversationContext.knowledgeBase).every(kb => Object.keys(kb).length === 0) && (
              <p className="text-gray-500 text-center py-4">No knowledge learned yet. Start researching and learning!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}