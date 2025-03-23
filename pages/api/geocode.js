export default async function handler(req, res) {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  
  try {
    // 使用OpenStreetMap Nominatim服务进行地理编码
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service error');
    }
    
    const data = await response.json();
    
    // 返回结果
    return res.status(200).json({
      results: data.map(item => ({
        id: item.place_id,
        name: item.display_name,
        coordinates: [parseFloat(item.lat), parseFloat(item.lon)]
      }))
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return res.status(500).json({ error: 'Failed to geocode location' });
  }
} 