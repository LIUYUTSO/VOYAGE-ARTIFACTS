// 移除或注释掉文件开头的旧collections定义
// export const collections = [
//   {
//     id: 1,
//     name: "Sakura Charm",
//     description: "A delicate cherry blossom-inspired artifact from Japan",
//     location: "Tokyo, Japan",
//     date: "2023/12/25",
//     modelPath: "/models/Chou.glb",
//     scale: 1.2,
//     coordinates: [35.6762, 139.6503],
//     travelNote: "Found this exquisite piece in a century-old craft shop in Asakusa..."
//   },
//   // 更多收藏品...
// ];

// 以下是完整的 locationInfo 数组，供主页和管理页面使用
export const locationInfo = {
  "sakura-charm": {
    id: "sakura-charm",
    name: "Sakura Charm",
    description: "A delicate cherry blossom-inspired artifact from Japan",
    location: "Tokyo, Japan",
    date: "2023-12-25",
    modelPath: "/models/Chou.glb",
    scale: 1.2,
    coordinates: [35.6762, 139.6503],
    travelNote: "Found this exquisite piece in a century-old craft shop in Asakusa."
  },
  "dynasty-echo": {
    id: "dynasty-echo",
    name: "Dynasty Echo",
    description: "Traditional Korean handicraft with historical significance",
    location: "Seoul, South Korea",
    date: "2023-10-15",
    modelPath: "/models/Korean.glb",
    scale: 1.0,
    coordinates: [37.5665, 126.9780],
    travelNote: "Purchased from a master craftsman who explained its cultural significance."
  },
  "lotus-whisper": {
    id: "lotus-whisper",
    name: "Lotus Whisper",
    description: "Thai-inspired decorative piece with intricate details",
    location: "Bangkok, Thailand",
    date: "2023-08-05",
    modelPath: "/models/Thai.glb",
    scale: 0.8,
    coordinates: [13.7563, 100.5018],
    travelNote: "Discovered in a floating market on a sunny afternoon."
  },
  "heritage-weave": {
    id: "heritage-weave",
    name: "Heritage Weave",
    description: "Hand-woven Vietnamese basket with traditional patterns",
    location: "Hanoi, Vietnam",
    date: "2023-06-20",
    modelPath: "/models/Vietnam.glb",
    scale: 1.5,
    coordinates: [21.0285, 105.8542],
    travelNote: "Created by a village artisan using techniques passed down for generations."
  }
};

// 以下是管理界面使用的 collections
export const collections = Object.values(locationInfo).map((item, index) => ({
  id: item.id,
  name: item.name,
  description: item.description || '',
  location: item.location,
  date: item.date || '',
  modelPath: item.modelPath,
  scale: item.scale || 1,
  coordinates: item.coordinates || [35.6762, 139.6503],
  travelNote: item.travelNote || ''
}));

// 从localStorage加载收藏品
export function loadCollections() {
  if (typeof window === 'undefined') return collections;
  
  const saved = localStorage.getItem('collections');
  return saved ? JSON.parse(saved) : collections;
}

// 保存收藏品到localStorage
export function saveCollections(updatedCollections) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('collections', JSON.stringify(updatedCollections));
  return updatedCollections;
}

// 更新添加收藏品函数
export function addCollection(newCollection) {
  const updatedCollections = [
    ...collections,
    {
      id: collections.length + 1,
      ...newCollection
    }
  ];
  
  // 更新内存中的数组
  collections.length = 0;
  collections.push(...updatedCollections);
  
  // 保存到localStorage
  saveCollections(updatedCollections);
  
  return collections;
}

// 辅助函数 - 从localStorage加载数据
export function loadCollectionsFromStorage() {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('collections');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading from storage:', error);
    return null;
  }
} 