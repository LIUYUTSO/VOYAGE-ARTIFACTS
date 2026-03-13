import { isAuthorized } from '../../utils/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    if (!isAuthorized(req)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // 保存数据到服务器
    const collections = req.body;
    // 这里可以先用文件系统存储
    await fs.writeFile('data/collections.json', JSON.stringify(collections));
    res.status(200).json({ success: true });
  } else if (req.method === 'GET') {
    // 从服务器获取数据
    const data = await fs.readFile('data/collections.json', 'utf8');
    res.status(200).json(JSON.parse(data));
  }
} 