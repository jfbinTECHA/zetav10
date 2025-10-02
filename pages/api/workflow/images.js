import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'workflow-images');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Ensure directory exists
      if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
      }

      const images = fs.readdirSync(IMAGES_DIR)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
        .map(file => ({
          name: file,
          path: `/workflow-images/${file}`,
          size: fs.statSync(path.join(IMAGES_DIR, file)).size,
          created: fs.statSync(path.join(IMAGES_DIR, file)).birthtime
        }))
        .sort((a, b) => new Date(b.created) - new Date(a.created));

      res.status(200).json(images);
    } catch (error) {
      res.status(500).json({ error: 'Failed to list images' });
    }
  } else if (req.method === 'POST') {
    try {
      // Ensure directory exists
      if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
      }

      const form = formidable({
        uploadDir: IMAGES_DIR,
        keepExtensions: true,
        filename: (name, ext, part) => `${Date.now()}-${part.originalFilename}`
      });

      const [fields, files] = await form.parse(req);
      const uploadedImages = [];

      if (files.image) {
        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        const newFilename = `${Date.now()}-${file.originalFilename}`;
        const newPath = path.join(IMAGES_DIR, newFilename);

        // Rename the file to our desired name
        fs.renameSync(file.filepath, newPath);

        uploadedImages.push({
          name: newFilename,
          path: `/workflow-images/${newFilename}`,
          size: file.size
        });
      }

      res.status(200).json({
        message: 'Images uploaded successfully',
        images: uploadedImages
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload images' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { filename } = req.query;
      if (!filename) {
        return res.status(400).json({ error: 'Filename required' });
      }

      const filepath = path.join(IMAGES_DIR, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        res.status(200).json({ message: 'Image deleted successfully' });
      } else {
        res.status(404).json({ error: 'Image not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete image' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};