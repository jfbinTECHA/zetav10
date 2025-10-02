export default async function handler(req, res) {
  if (req.method === "GET") {
    // Mock transformers data
    const transformers = [
      {
        id: "text-preprocessor",
        name: "Text Preprocessor",
        description: "Clean and normalize text data for AI processing",
        status: "active",
        inputType: "string",
        outputType: "string",
        model: "custom",
        config: {
          lowercase: true,
          removePunctuation: true,
          normalizeUnicode: true,
        },
        preprocessing: ["lowercase", "remove_punctuation"],
        postprocessing: ["normalize_unicode"],
      },
      {
        id: "sentiment-analyzer",
        name: "Sentiment Analyzer",
        description: "Analyze sentiment and emotion in text",
        status: "active",
        inputType: "string",
        outputType: "object",
        model: "distilbert-base-uncased-finetuned-sst-2-english",
        config: {
          model: "distilbert-base-uncased-finetuned-sst-2-english",
          returnAllScores: false,
        },
        preprocessing: ["tokenize"],
        postprocessing: ["decode_labels"],
      },
      {
        id: "data-aggregator",
        name: "Data Aggregator",
        description: "Combine and aggregate multiple data sources",
        status: "inactive",
        inputType: "array",
        outputType: "object",
        model: null,
        config: {
          aggregationMethod: "mean",
          groupBy: "category",
        },
        preprocessing: ["validate_data"],
        postprocessing: ["format_output"],
      },
      {
        id: "image-processor",
        name: "Image Processor",
        description: "Process and analyze images for features",
        status: "active",
        inputType: "image",
        outputType: "object",
        model: "resnet-50",
        config: {
          model: "resnet-50",
          includeTop: false,
          pooling: "avg",
        },
        preprocessing: ["resize", "normalize"],
        postprocessing: ["extract_features"],
      },
    ];

    return res.status(200).json(transformers);
  }

  if (req.method === "POST" && req.url.includes("/test")) {
    const { transformerId, input } = req.body;

    // Mock transformer test response
    const mockOutputs = {
      "text-preprocessor": "hello world this is clean text",
      "sentiment-analyzer": { label: "POSITIVE", score: 0.9876 },
      "data-aggregator": { aggregated: 42.5, count: 10 },
      "image-processor": { features: [0.1, 0.2, 0.3, 0.4, 0.5] },
    };

    const output = mockOutputs[transformerId] || {
      error: "Unknown transformer",
    };

    return res.status(200).json({ output });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
