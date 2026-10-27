import { searchYouTube } from '../server.js';

export default async function handler(req, res) {
  try {
    const { q = '', target = 'video', country = '', hours = '0' } = req.query;
    if (!q.trim()) return res.status(400).json({ error: 'Search query is required' });
    const data = await searchYouTube(q, target, country, Number(hours) || 0);
    res.setHeader('Cache-Control', 's-maxage=900');
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}