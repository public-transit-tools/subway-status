[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)

# SubwayStatus.com
SubwayStatus.com is a platform designed to provide clear, up-to-date information about subway systems around the world. The project aims to make it easy for riders to check the status of their local subway network, including service changes, slow zones, and other important updates, all in a simple and modern interface.

## Project Structure
### Landing Page
The main site (subwaystatus.com) serves as a welcoming landing page, introducing the project and its mission.
It provides a central place for users to discover which subway systems are currently supported.
### Network List
The "Networks" page lists all subway systems available on the platform.
Each system is accessible via its own subdomain (e.g., ttc.subwaystatus.com for Toronto's TTC).
As of now, the only supported system is the Toronto Transit Commission (TTC).
### System Subdomains
Each supported subway system has its own dedicated subdomain, offering detailed, system-specific status, maps, and features.
Example: ttc.subwaystatus.com

## Vercel Deployment
This project contains two separate applications that can be deployed to Vercel:
- **Landing Page**: The main informational site.
- **TTC App**: The application for the Toronto Transit Commission.

To deploy these applications on Vercel, you will need to create two separate projects in your Vercel dashboard and configure the "Root Directory" for each.

### Landing Page Deployment
1. Create a new project in Vercel and connect it to your Git repository.
2. In the project settings, set the **Root Directory** to `Landing Page`.
3. Vercel will automatically detect that it is a static site. No framework preset is needed.
4. Deploy the project. This will be your main domain (e.g., `subwaystatus.com`).

### TTC App Deployment
1. Create a second project in Vercel and connect it to the same Git repository.
2. In the project settings, set the **Root Directory** to `TTC`.
3. Vercel will automatically detect that it is a static site. No framework preset is needed.
4. Deploy the project. You should assign a subdomain to this project (e.g., `ttc.subwaystatus.com`).

## Vision & Future Plans
Scalable: The platform is designed to easily add more subway systems from cities around the world.
User-Focused: Simple, fast, and mobile-friendly design for quick access to essential information.
Open Data: Where possible, the project uses open data sources and aims to be transparent about data origins.
Community-Driven: Contributions and suggestions for new systems or features are welcome.
## Contributing
If you are interested in helping expand SubwayStatus.com to support more cities or want to improve the landing/network list experience, feel free to open an issue or submit a pull request.

SubwayStatus.com is an independent project and is not affiliated with any transit agency. Always refer to official sources for the most current information.

## React App (Vite)
There is a React implementation under `react-app/` mirroring the Landing, Networks, and TTC pages with Leaflet.

Run locally:

1. `cd react-app`
2. `npm i`
3. `npm run dev`

Build:

- `npm run build` then `npm run preview`

TTC data:

- Copy `TTC/lines/line1.json`, `line2.json`, `line4.json` into `react-app/public/ttc/lines/` to render the lines on the TTC map.
