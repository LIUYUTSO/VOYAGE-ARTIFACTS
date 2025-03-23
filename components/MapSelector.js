import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapSelector = ({ coordinates, onChange }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  
  useEffect(() => {
    // 自定义黑色图标
    const blackIcon = L.icon({
      iconUrl: '/images/marker-black.png', // 确保您有这个黑色图标文件
      iconRetinaUrl: '/images/marker-black-2x.png',
      shadowUrl: '/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    if (!mapRef.current) {
      const map = L.map('map-selector').setView(coordinates, 5);
      mapRef.current = map;
      
      // 使用与首页相同的地图样式
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        // 添加与首页相同的样式选项
        className: 'map-tiles',
        tileSize: 512,
        zoomOffset: -1
      }).addTo(map);
      
      // 使用黑色图标创建标记
      const marker = L.marker(coordinates, { 
        draggable: true,
        icon: blackIcon 
      }).addTo(map);
      
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
    }
    
    if (markerRef.current) {
      markerRef.current.setLatLng(coordinates);
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [coordinates, onChange]);
  
  return (
    <div id="map-selector" className="h-full w-full">
      {/* 添加与首页相同的地图样式 */}
      <style jsx global>{`
        .map-tiles {
          filter: grayscale(100%) brightness(100%) contrast(85%);
        }
      `}</style>
    </div>
  );
};

export default MapSelector; 