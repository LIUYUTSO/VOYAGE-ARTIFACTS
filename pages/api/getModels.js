import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const modelsDir = path.join(process.cwd(), 'public/models');
    
    // 检查目录是否存在
    if (!fs.existsSync(modelsDir)) {
      return res.status(200).json({ models: [] });
    }
    
    // 读取目录内容
    const files = fs.readdirSync(modelsDir);
    
    // 过滤出.glb和.gltf文件
    const modelFiles = files.filter(file => 
      file.endsWith('.glb') || file.endsWith('.gltf')
    );
    
    // 格式化为路径
    const models = modelFiles.map(file => `/models/${file}`);
    
    res.status(200).json({ models });
  } catch (error) {
    console.error('Error scanning models directory:', error);
    res.status(500).json({ error: 'Failed to scan models directory' });
  }
} 