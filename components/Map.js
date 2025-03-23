import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

export default function Map({ locations, onSelectLocation }) {
  useEffect(() => {
    // 創建自定義黑色圖標
    const blackIcon = new L.Icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="25" height="41" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path fill="black" d="M50 0C29.86 0 13.23 16.63 13.23 37.15c0 6.91 1.07 13.31 3.96 18.79L50 100l32.81-44.06c2.89-5.48 3.96-11.88 3.96-18.79C86.77 16.63 70.14 0 50 0zm0 50c-7.18 0-13-5.82-13-13s5.82-13 13-13 13 5.82 13 13-5.82 13-13 13z"/>
        </svg>
      `),
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    // 設置為默認圖標
    L.Marker.prototype.options.icon = blackIcon;

    return () => {
      // 清理圖標設置
      L.Marker.prototype.options.icon = null;
    };
  }, []);

  return (
    <MapContainer 
      center={[20, 110]}
      zoom={4} 
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={19}
      />
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={location.coordinates}
          eventHandlers={{
            click: () => onSelectLocation(location),
          }}
        />
      ))}
    </MapContainer>
  );
} 