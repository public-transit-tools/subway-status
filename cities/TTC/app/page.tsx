'use client'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function TTCPage() {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!ref.current) return
    const map = L.map(ref.current).setView([43.665, -79.385], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)

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
      load('/lines/line1.json', 'rgba(248,195,0,0.4)', '#F8C300'),
      load('/lines/line2.json', 'rgba(0,146,63,0.4)', '#00923F'),
      load('/lines/line4.json', 'rgba(162,26,104,0.4)', '#A21A68'),
    ])

    return () => map.remove()
  }, [])

  return (
    <main style={{height:'100vh', margin:0}}>
      <div ref={ref} style={{height:'100vh'}} />
    </main>
  )
}

