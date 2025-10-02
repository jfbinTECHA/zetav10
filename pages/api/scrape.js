const axios = require('axios');
const cheerio = require('cheerio');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    let finalUrl = url;
    let isGitHub = false;
    let isYouTube = false;

    // Special handling for GitHub repositories
    if (url.includes('github.com/') && !url.includes('/blob/') && !url.includes('/raw/')) {
      // Extract user/repo from GitHub URL
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?/);
      if (match) {
        const [, user, repo] = match;
        // Try to fetch README.md
        finalUrl = `https://raw.githubusercontent.com/${user}/${repo}/main/README.md`;
        isGitHub = true;
      }
    }

    // Special handling for YouTube videos
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      isYouTube = true;
      // Keep original URL for scraping metadata
    }

    const response = await axios.get(finalUrl, {
      headers: isGitHub ? {
        'User-Agent': 'ZetaAIScraper/1.0 (Learning purposes - respects GitHub TOS)',
        'Accept': 'text/plain, text/markdown'
      } : {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000,
      maxRedirects: 5
    });

    if (isGitHub) {
      // Handle GitHub README (markdown)
      const title = `GitHub: ${url.split('/').slice(-2).join('/')}`;
      const text = response.data; // Raw markdown

      res.status(200).json({
        title,
        text: text.substring(0, 10000), // Allow more for code
        links: [], // No links from markdown
        url,
        type: 'github'
      });
    } else if (isYouTube) {
      // Handle YouTube video metadata
      const $ = cheerio.load(response.data);

      // Extract from JSON-LD structured data
      let videoData = {};
      $('script[type="application/ld+json"]').each((i, el) => {
        try {
          const json = JSON.parse($(el).html());
          if (json['@type'] === 'VideoObject') {
            videoData = json;
          }
        } catch (e) {
          // Ignore invalid JSON
        }
      });

      const title = videoData.name || $('title').text().replace(' - YouTube', '').trim();
      const description = videoData.description || '';
      const uploadDate = videoData.uploadDate || '';
      const duration = videoData.duration || '';

      // Try to get transcript if available (basic check)
      const hasTranscript = response.data.includes('transcript') || response.data.includes('caption');

      const text = `Title: ${title}\n\nDescription: ${description}\n\nUpload Date: ${uploadDate}\nDuration: ${duration}\n\n${hasTranscript ? 'This video appears to have captions/transcripts available.' : 'No transcript detected.'}`;

      res.status(200).json({
        title: `YouTube: ${title}`,
        text: text.substring(0, 5000),
        links: [],
        url,
        type: 'youtube',
        metadata: { title, description, uploadDate, duration, hasTranscript }
      });
    } else {
      // Check if response is HTML
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('text/html')) {
        return res.status(400).json({ error: 'URL does not return HTML content' });
      }

      const $ = cheerio.load(response.data);
      const title = $('title').text().trim() || 'No title found';
      const bodyText = $('body').text() || $('html').text() || response.data;
      const text = bodyText.replace(/\s+/g, ' ').trim();

      const links = [];
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.startsWith('http')) {
          links.push(href);
        }
      });

      res.status(200).json({
        title,
        text: text.substring(0, 5000), // limit text
        links: links.slice(0, 20), // limit links
        url
      });
    }
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      error: 'Failed to scrape: ' + (error.response?.status ? `HTTP ${error.response.status}` : error.message)
    });
  }
}