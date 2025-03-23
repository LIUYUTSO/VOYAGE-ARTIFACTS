import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapSelectorInner = ({ coordinates, onChange }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // 初始化地圖
    const map = L.map('map-selector').setView(coordinates, 5);
    mapRef.current = map;
    
    // 添加地圖圖層
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);
    
    // 創建標記
    const marker = L.marker(coordinates, { draggable: true }).addTo(map);
    markerRef.current = marker;
    
    // 處理點擊事件
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onChange([lat, lng]);
    });
    
    // 處理標記拖動事件
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      onChange([lat, lng]);
    });
    
    return () => {
      map.remove();
    };
  }, []);
  
  // 當坐標發生變化時更新標記位置
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng(coordinates);
      
      // 只有當坐標變化很大時才重新設置視圖
      const currentCenter = mapRef.current.getCenter();
      const distance = mapRef.current.distance(
        [currentCenter.lat, currentCenter.lng],
        coordinates
      );
      
      if (distance > 1000000) { // 1000公里
        mapRef.current.setView(coordinates);
      }
    }
  }, [coordinates]);
  
  return <div id="map-selector" className="h-full w-full" />;
};

export default MapSelectorInner; 