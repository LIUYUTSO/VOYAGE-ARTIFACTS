export default function handler(req, res) {
  // 從環境變量獲取密碼
  const correctPassword = process.env.ADMIN_PASSWORD;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '僅支持POST請求' });
  }
  
  const { password } = req.body;
  
  if (password === correctPassword) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ error: '密碼錯誤' });
  }
} 