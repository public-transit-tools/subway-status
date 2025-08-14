import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export function TTC() {
  const mapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!mapRef.current) return
    const map = L.map(mapRef.current).setView([43.665, -79.385], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    const load = async (path: string, colorRegular: string, colorRSZ: string) => {
      const res = await fetch(path)
      const geo = await res.json()
      L.geoJSON(geo, {
        filter: (f: any) => f.properties.type === 'tracks' || f.properties.type === 'rsz',
        style: (f: any) => ({
          color: f.properties.type === 'rsz' ? colorRSZ : colorRegular,
          weight: f.properties.type === 'rsz' ? 7 : 5,
          opacity: f.properties.type === 'rsz' ? 0.9 : 0.7,
        })
      }).addTo(map)
    }

    Promise.all([
      load('/ttc/lines/line1.json', 'rgba(248,195,0,0.4)', '#F8C300'),
      load('/ttc/lines/line2.json', 'rgba(0,146,63,0.4)', '#00923F'),
      load('/ttc/lines/line4.json', 'rgba(162,26,104,0.4)', '#A21A68'),
    ])

    return () => { map.remove() }
  }, [])

  return (
    <div className="page ttc">
      <header>
        <h1>TTC Reduced Speed Zone Tracker</h1>
      </header>
      <main>
        <div id="map" ref={mapRef} style={{height: '80vh'}} />
      </main>
      <footer>
        <p>&copy; 2025 SubwayStatus.com</p>
      </footer>
    </div>
  )
}

