## Subway Status

Tools for viewing the status of subway networks, focused on clear, lightweight, static web apps.

This repo currently includes a prototype for the Toronto Transit Commission (TTC) showing Reduced Speed Zones (RSZ) on an interactive map, plus a simple landing page that can list multiple systems.

### Live
- TTC RSZ: `https://ttc.subwaystatus.com`

### Project structure
- `Landing Page/`: Minimal homepage and networks list
  - `index.html`: Welcome page
  - `networks.html`: Links to available systems (currently TTC)
- `TTC/`: TTC Reduced Speed Zone tracker
  - `index.html`: Leaflet map UI
  - `script.js`: Map logic, loads GeoJSON, renders lines and RSZ segments
  - `lines/line1.json`, `lines/line2.json`, `lines/line4.json`: Static data for TTC Lines 1, 2, and 4 (including RSZ features)
  - `style.css`: Page styles

### Features (TTC RSZ)
- Interactive Leaflet map centered on Toronto
- Renders Lines 1, 2, and 4 with official colors
- Highlights Reduced Speed Zone segments and lists them in a sidebar
- Popups show line, direction, station-to-station span, speed, and reason
- Basic line filter UI scaffold (placeholder for future functionality)

### Run locally
This is a static site. To avoid browser restrictions on `fetch` from the local file system, serve the repo via a local HTTP server and open the pages through `http://`.

From the repo root:

Option A — Python 3
```bash
python -m http.server 5500
# then open: http://localhost:5500/Landing%20Page/index.html
# or directly: http://localhost:5500/TTC/index.html
```

Option B — Node.js
```bash
npx serve . -l 5500 --single
# then open: http://localhost:5500/Landing%20Page/index.html
# or directly: http://localhost:5500/TTC/index.html
```

### Data
- TTC data in this prototype is static and lives in `TTC/lines/*.json`.
- RSZ segments are encoded as GeoJSON features with `properties.type === "rsz"` and attributes like `start_station`, `end_station`, `direction`, `speed_kph`, and `reason`.

### Development notes
- No build step; dependencies (Leaflet) are loaded from CDNs in `TTC/index.html`.
- Styling is plain CSS; no frameworks.
- To add another system, create a new directory at the repo root, add your static app there, and link to it from `Landing Page/networks.html`.

### Disclaimer
This is an unofficial tool and not affiliated with the TTC. Data is based on publicly available information and may be incomplete or out of date. Always refer to official TTC sources for the latest updates.
