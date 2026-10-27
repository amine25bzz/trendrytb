import { fetchCountryTrends } from '../server.js';

export default async function handler(req, res) {
  try {
    const cc = (req.query.country || 'US').toString();
    const data = await fetchCountryTrends(cc);
    res.setHeader('Cache-Control', 's-maxage=10800, stale-while-revalidate');
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}