export default async function handler(req, res) {
  if (req.method === "GET") {
    // Mock plugins data (public dashboard information)
    const plugins = [
      {
        id: "openai-plugin",
        name: "OpenAI Integration",
        description:
          "Integrate with OpenAI's GPT models for advanced AI capabilities",
        version: "1.2.0",
        type: "ai-provider",
        enabled: true,
        endpoint: "https://api.openai.com/v1",
        apiKey: "***masked***",
        rateLimit: 60,
      },
      {
        id: "anthropic-plugin",
        name: "Anthropic Claude",
        description:
          "Access Anthropic's Claude AI models for safe and helpful responses",
        version: "1.0.5",
        type: "ai-provider",
        enabled: false,
        endpoint: "https://api.anthropic.com",
        apiKey: null,
        rateLimit: 30,
      },
      {
        id: "huggingface-plugin",
        name: "Hugging Face Models",
        description:
          "Use open-source models from Hugging Face for various AI tasks",
        version: "0.9.2",
        type: "model-hub",
        enabled: true,
        endpoint: "https://api-inference.huggingface.co",
        apiKey: "***masked***",
        rateLimit: 100,
      },
      {
        id: "web-scraper",
        name: "Web Scraping Tool",
        description: "Extract data from websites for analysis and processing",
        version: "2.1.0",
        type: "data-source",
        enabled: true,
        endpoint: null,
        apiKey: null,
        rateLimit: 20,
      },
    ];

    return res.status(200).json(plugins);
  }

  if (req.method === "PATCH") {
    const { id } = req.query;
    const { enabled } = req.body;

    // In a real app, update the plugin status in database
    console.log(`Toggling plugin ${id} to ${enabled}`);

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
