import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { locationInfo as defaultLocationInfo } from '../data/collections';

// Dynamic imports for client-side only components
const MapSelector = dynamic(() => import('../components/MapSelector'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

const ModelPreview = dynamic(() => import('../components/ModelPreview'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <svg className="animate-spin h-8 w-8 mx-auto text-gray-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p>Loading model viewer...</p>
    </div>
  </div>
});

// Default collections (replace with your own or load from localStorage)
const defaultCollections = [
  {
    id: 1,
    name: "Sakura Charm",
    description: "A delicate cherry blossom-inspired artifact from Japan",
    location: "Tokyo, Japan",
    date: "2023/12/25",
    modelPath: "/models/Chou.glb",
    scale: 1.2,
    coordinates: [35.6762, 139.6503],
    travelNote: "Found this exquisite piece in a century-old craft shop in Asakusa."
  }
  // Add more items as needed
];

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [collections, setCollections] = useState(defaultLocationInfo);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    location: '',
    date: '',
    modelPath: '',
    scale: 1,
    coordinates: [35.6762, 139.6503], // Default to Tokyo
    travelNote: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableModels, setAvailableModels] = useState([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 获取可用模型列表
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/getModels');
        if (response.ok) {
          const data = await response.json();
          setAvailableModels(data.models || []);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };
    
    fetchModels();
  }, []);

  useEffect(() => {
    // 仅在客户端预加载模型
    if (typeof window !== 'undefined' && availableModels.length > 0) {
      // 动态导入预加载函数
      import('../components/ModelPreview').then(module => {
        if (module.preloadModels) {
          // 预加载前5个模型或全部模型(如果少于5个)
          const modelsToPreload = availableModels.slice(0, Math.min(5, availableModels.length));
          module.preloadModels(modelsToPreload);
        }
      });
    }
  }, [availableModels]);

  const checkPassword = () => {
    if (password === '45636112') {
      setAuthorized(true);
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  const handleFileUpload = async (e) => {
    console.log('File upload started');
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    console.log('Selected file:', file.name);
    
    try {
      setIsUploading(true);
      setUploadStatus('Uploading...');
      
      // 简单的路径设置
      const modelPath = `/models/${file.name}`;
      console.log('Setting model path to:', modelPath);
      setNewItem(prev => {
        console.log('Previous state:', prev);
        return {...prev, modelPath: modelPath};
      });
      setUploadStatus('Upload simulated successfully');
    } catch (error) {
      console.error('Error in upload process:', error);
      setUploadStatus(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCollection = (newCollection) => {
    setCollections(prev => ({
      ...prev,
      [newCollection.id]: newCollection
    }));
    // 仅预览，不保存
  };

  const handleEditCollection = (id, updatedCollection) => {
    setCollections(prev => ({
      ...prev,
      [id]: updatedCollection
    }));
    // 仅预览，不保存
  };

  const selectForEdit = (item) => {
    setNewItem({...item});
    setEditMode(true);
    setEditId(item.id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 验证是否有模型路径
    if (!newItem.modelPath) {
      alert('Please provide a model path or upload a model file');
      return;
    }
    
    if (editMode) {
      handleEditCollection(editId, newItem);
      alert('Item updated successfully!');
      setEditMode(false);
      setEditId(null);
    } else {
      handleAddCollection(newItem);
      alert('New item added successfully!');
    }
    
    // Reset form
    setNewItem({
      name: '',
      description: '',
      location: '',
      date: '',
      modelPath: '',
      scale: 1,
      coordinates: [35.6762, 139.6503],
      travelNote: ''
    });
  };

  const saveToMainPage = () => {
    try {
      // 将当前管理页面的集合数据保存到 localStorage
      localStorage.setItem('collections', JSON.stringify(collections));
      
      // 转换为主页需要的格式并保存
      const formattedForIndex = Object.values(collections).map(item => ({
        name: item.name,
        description: item.description,
        location: item.location,
        date: item.date,
        modelPath: item.modelPath,
        scale: item.scale,
        coordinates: item.coordinates,
        travelNote: item.travelNote
      }));
      
      localStorage.setItem('locationInfo', JSON.stringify(formattedForIndex));
      
      alert('Changes saved successfully! The main page will now display these items.');
    } catch (error) {
      console.error('Save error:', error);
      alert(`Error saving data: ${error.message}`);
    }
  };

  const resetToDefaultCollections = () => {
    if (window.confirm('Are you sure you want to reset to default collections? This will delete all your changes.')) {
      // 从data/collections.js导入默认数据
      import('../data/collections').then(({ locationInfo }) => {
        // 转换格式
        const formattedCollections = locationInfo.map((item, index) => ({
          id: index + 1,
          name: item.name,
          description: item.description || '',
          location: item.location,
          date: item.date || '',
          modelPath: item.modelPath,
          scale: item.scale || 1,
          coordinates: item.coordinates || [35.6762, 139.6503],
          travelNote: item.travelNote || ''
        }));
        
        // 更新状态和localStorage
        setCollections(formattedCollections.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}));
        alert('Successfully reset to default collections!');
      });
    }
  };

  // 添加检查模型路径函数
  const checkAndFixModelPaths = async () => {
    try {
      // 获取可用模型列表
      const response = await fetch('/api/getModels');
      if (!response.ok) {
        throw new Error('无法获取模型列表');
      }
      
      const data = await response.json();
      const availableModels = data.models || [];
      
      if (availableModels.length === 0) {
        alert('没有找到模型文件。请先上传模型到 public/models 目录。');
        return;
      }
      
      // 检查当前集合中是否有无效模型路径
      let hasChanges = false;
      const updatedCollections = Object.values(collections).map(item => {
        // 检查当前模型路径是否存在
        if (!availableModels.includes(item.modelPath)) {
          hasChanges = true;
          
          // 尝试找到类似名称的模型
          const fileName = item.modelPath.split('/').pop();
          const baseName = fileName.split('.')[0];
          
          // 寻找相似名称的模型
          const similarModel = availableModels.find(model => {
            const modelName = model.split('/').pop();
            return modelName.toLowerCase().includes(baseName.toLowerCase());
          });
          
          // 更新为找到的相似模型或第一个可用模型
          return {
            ...item,
            modelPath: similarModel || availableModels[0],
            _originalPath: item.modelPath // 保存原始路径以供参考
          };
        }
        
        return item;
      });
      
      if (!hasChanges) {
        alert('所有模型路径都有效，无需修复。');
        return;
      }
      
      // 更新集合
      setCollections(updatedCollections.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}));
      alert('已自动修复无效的模型路径。请查看更新后的集合项。');
      
    } catch (error) {
      console.error('Fix error:', error);
      alert(`修复模型路径时出错: ${error.message}`);
    }
  };

  // 添加搜索功能
  const searchLocation = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Location search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // 处理选择搜索结果
  const handleSelectLocation = (result) => {
    setNewItem({
      ...newItem,
      location: result.name.split(',')[0], // 使用第一部分作为地点名称
      coordinates: result.coordinates
    });
    setLocationSearch('');
    setSearchResults([]);
  };

  // 更新useEffect中添加防抖搜索
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (locationSearch) {
        searchLocation(locationSearch);
      }
    }, 500); // 500ms防抖
    
    return () => clearTimeout(delaySearch);
  }, [locationSearch]);

  // 优化选择模型时的处理
  const handleSelectModel = (modelPath) => {
    // 如果选择的是同一个模型，不触发状态更新
    if (newItem.modelPath === modelPath) return;
    
    setNewItem({...newItem, modelPath});
    
    // 预加载选中的模型
    if (modelPath) {
      import('../components/ModelPreview').then(module => {
        if (module.preloadModels) {
          module.preloadModels([modelPath]);
        }
      });
    }
  };

  const syncData = async () => {
    try {
      // 获取最新数据
      const response = await fetch('/api/sync');
      const serverData = await response.json();
      // 更新本地存储
      localStorage.setItem('collections', JSON.stringify(serverData));
      // 刷新页面显示
      setCollections(serverData.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}));
    } catch (error) {
      console.error('同步失败:', error);
    }
  };

  if (!authorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded mb-4" 
          placeholder="Enter password"
          onKeyPress={(e) => e.key === 'Enter' && checkPassword()}
        />
        <button 
          onClick={checkPassword}
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700"
        >
          Login
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-8">
          <p className="text-gray-900 font-medium">Loading collection data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 -mt-6">
      {/* 页面顶部标题区域修改 */}
      <div className="pt-12 pb-8 bg-black">
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
            VOYAGE ARTIFACTS
          </h1>
          <div className="mt-2 w-16 h-[1px] bg-gradient-to-r from-gray-400 to-gray-200 mx-auto"></div>
          <p className="mt-4 text-gray-100 tracking-wide text-sm">
            MODEL COLLECTION MANAGEMENT SYSTEM
          </p>
          <p className="mt-2 text-gray-400 text-sm font-light">
            Add, edit and manage your 3D artifact collections
          </p>
        </div>
      </div>
      
      {/* 表单区域 - 更现代的设计 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-10">
        <div className="flex items-center p-6 bg-gray-50 border-b border-gray-100">
          <span className="w-2 h-6 bg-gradient-to-b from-gray-800 to-gray-600 rounded mr-3"></span>
          <h2 className="text-xl font-medium text-gray-900 tracking-wide">
            {editMode ? 'Edit Artifact' : 'New Artifact'}
          </h2>
          {editMode && (
            <button 
              onClick={() => {
                setEditMode(false);
                setEditId(null);
                setNewItem({
                  name: '',
                  description: '',
                  location: '',
                  date: '',
                  modelPath: '',
                  scale: 1,
                  coordinates: [35.6762, 139.6503],
                  travelNote: ''
                });
              }}
              className="ml-auto px-4 py-2 bg-gray-200 rounded-full text-sm hover:bg-gray-300 text-gray-700 transition-all font-medium"
            >
              Cancel Edit
            </button>
          )}
        </div>
        
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="font-bold">Preview Mode</p>
          <p>Changes made here are for preview only. To update the website, please modify the collections.js file.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-all"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <input
                  type="text"
                  value={locationSearch || newItem.location}
                  onChange={(e) => {
                    setLocationSearch(e.target.value);
                    setNewItem({...newItem, location: e.target.value});
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-all"
                  placeholder="Search for location..."
                  required
                />
                
                {/* 搜索图标 */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {isSearching ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
                
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {searchResults.map(result => (
                      <div 
                        key={result.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-800 border-b border-gray-50 last:border-none"
                        onClick={() => handleSelectLocation(result)}
                      >
                        {result.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newItem.date}
                onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-all"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Scale</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={newItem.scale}
                  onChange={(e) => setNewItem({...newItem, scale: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-all"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">倍率</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-1 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-all"
              rows={3}
              required
            />
          </div>
          
          <div className="space-y-1 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Travel Note</label>
            <textarea
              value={newItem.travelNote}
              onChange={(e) => setNewItem({...newItem, travelNote: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-all"
              rows={4}
            />
          </div>
          
          {/* Map Selector Component */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="w-1.5 h-1.5 bg-gray-700 rounded-full mr-2"></span>
              <label className="text-sm font-medium text-gray-700">Geographic Location</label>
            </div>
            <div className="h-[350px] border border-gray-200 rounded-lg overflow-hidden shadow-inner">
              <MapSelector 
                coordinates={newItem.coordinates} 
                onChange={(coords) => setNewItem({...newItem, coordinates: coords})}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Latitude: {newItem.coordinates[0].toFixed(4)}</span>
              <span>Longitude: {newItem.coordinates[1].toFixed(4)}</span>
            </div>
          </div>
          
          {/* 3D Model Selection */}
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <span className="w-1.5 h-1.5 bg-gray-700 rounded-full mr-2"></span>
              <label className="text-sm font-medium text-gray-700">3D Model</label>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Upload New Model</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".glb,.gltf"
                      onChange={handleFileUpload}
                      className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-800 focus:outline-none"
                      disabled={isUploading}
                    />
                    {uploadStatus && (
                      <div className="mt-1 text-xs">
                        <span className={isUploading ? "text-blue-500" : "text-green-500"}>
                          {uploadStatus}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Select Existing Model
                  </label>
                  <select 
                    value={newItem.modelPath} 
                    onChange={(e) => handleSelectModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-800 focus:outline-none"
                  >
                    <option value="">-- Select a model --</option>
                    {availableModels.map(model => (
                      <option key={model} value={model}>
                        {model.split('/').pop()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center mb-1">
                <div className="w-full h-px bg-gray-200"></div>
                <span className="px-2 text-xs text-gray-500">OR</span>
                <div className="w-full h-px bg-gray-200"></div>
              </div>
              
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Enter Model Path Directly
                </label>
                <input
                  type="text"
                  value={newItem.modelPath}
                  onChange={(e) => setNewItem({...newItem, modelPath: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-800 focus:outline-none"
                  placeholder="/models/your-model.glb"
                />
              </div>
              
              {/* Model Preview */}
              {newItem.modelPath ? (
                <div className="h-[250px] border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <ModelPreview modelPath={newItem.modelPath} scale={newItem.scale} />
                </div>
              ) : (
                <div className="h-[250px] border border-gray-200 rounded-lg flex items-center justify-center bg-white">
                  <div className="text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                    <p className="text-sm">Select or upload a 3D model to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all font-medium tracking-wide"
          >
            {editMode ? 'UPDATE ARTIFACT' : 'ADD ARTIFACT'}
          </button>
        </form>
      </div>
      
      {/* 集合项目区域 - 更现代的设计 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-10">
        <div className="flex items-center p-6 bg-gray-50 border-b border-gray-100">
          <span className="w-2 h-6 bg-gradient-to-b from-gray-800 to-gray-600 rounded mr-3"></span>
          <h2 className="text-xl font-medium text-gray-900 tracking-wide">
            Artifact Collection
          </h2>
          <div className="ml-auto flex flex-wrap gap-2">
            <button 
              onClick={saveToMainPage}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 text-white hover:from-gray-600 hover:to-gray-500 text-sm transition-all"
            >
              Save to Main Page
            </button>
            <button 
              onClick={resetToDefaultCollections}
              className="px-4 py-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 text-sm transition-all"
            >
              Reset to Default
            </button>
            <button 
              onClick={checkAndFixModelPaths}
              className="px-4 py-2 rounded-full bg-gray-400 text-white hover:bg-gray-300 text-sm transition-all"
            >
              Auto-fix Models
            </button>
            <button 
              onClick={() => {
                const data = JSON.stringify(Object.values(collections));
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'voyage-artifacts-backup.json';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 text-sm transition-all"
            >
              Export Data
            </button>
            
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const importedData = JSON.parse(event.target.result);
                      setCollections(importedData.reduce((acc, item) => ({ ...acc, [item.id]: item }), {}));
                      alert('Data imported successfully!');
                    } catch (error) {
                      alert('Error importing data: Invalid file format');
                    }
                  };
                  reader.readAsText(file);
                }
              }}
              style={{ display: 'none' }}
              id="import-data"
            />
            <button 
              onClick={() => document.getElementById('import-data').click()}
              className="px-4 py-2 rounded-full bg-gray-600 text-white hover:bg-gray-500 text-sm transition-all"
            >
              Import Data
            </button>
          </div>
        </div>
        
        {/* 表格部分 */}
        {Object.values(collections).length === 0 ? (
          <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-400 mt-4 text-lg">Your collection is empty</p>
            <p className="text-gray-300 mt-1">Add your first artifact using the form above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Name</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Location</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Date</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.values(collections).map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-gray-800">{item.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.location}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{item.date}</td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex space-x-4">
                        <button 
                          onClick={() => selectForEdit(item)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </span>
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this item?')) {
                              setCollections(prev => ({
                                ...prev,
                                [item.id]: undefined
                              }));
                            }
                          }}
                          className="text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* 更现代的页脚设计 */}
      <div className="text-center pb-10">
        <div className="w-16 h-[1px] bg-gradient-to-r from-gray-300 to-gray-100 mx-auto mb-4"></div>
        <p className="text-gray-400 text-xs tracking-wide">
          VOYAGE ARTIFACTS &copy; {new Date().getFullYear()} | COLLECTION MANAGEMENT
        </p>
      </div>
    </div>
  );
} 