import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapSelectorInner = ({ coordinates, onChange }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // 初始化地图的 useEffect
  useEffect(() => {
    const map = L.map('map-selector').setView(coordinates, 5);
    mapRef.current = map;
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);
    
    const marker = L.marker(coordinates, { draggable: true }).addTo(map);
    markerRef.current = marker;
    
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onChange([lat, lng]);
    });
    
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      onChange([lat, lng]);
    });
    
    return () => {
      map.remove();
    };
  }, [coordinates, onChange]); // ✅ 已经正确添加了依赖项
  
  // 更新标记位置的 useEffect
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng(coordinates);
      
      const currentCenter = mapRef.current.getCenter();
      const distance = mapRef.current.distance(
        [currentCenter.lat, currentCenter.lng],
        coordinates
      );
      
      if (distance > 1000000) {
        mapRef.current.setView(coordinates);
      }
    }
  }, [coordinates]); // coordinates 已经在依赖数组中
  
  return <div id="map-selector" className="h-full w-full" />;
};

MapSelectorInner.displayName = 'MapSelectorInner'; // 添加显示名称
export default MapSelectorInner; 