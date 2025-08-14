let map; // Make map globally accessible for functions
const geoJsonLayers = {}; // To store references to GeoJSON layers for filtering
let branchName; // To store the branch name

// Sidebar toggle logic
document.addEventListener("DOMContentLoaded", function () {
  // Get branch name from meta tag
  const branchNameMeta = document.querySelector('meta[name="branch-name"]');
  if (branchNameMeta) {
    branchName = branchNameMeta.getAttribute('content');
    console.log(`Branch name: ${branchName}`);
  }
  const aside = document.querySelector("aside");
  const toggleBtn = document.getElementById("sidebarToggle");
  let collapsed = localStorage.getItem("sidebarCollapsed") === "true";

  // Create a floating reopen button
  let reopenBtn = document.createElement("button");
  reopenBtn.innerText = "☰";
  reopenBtn.title = "Show sidebar";
  reopenBtn.id = "sidebarReopenBtn";
  reopenBtn.style.display = "none";
  // Append to #map-container so it floats over the map
  const mapContainer = document.getElementById("map-container");
  if (mapContainer) {
    mapContainer.appendChild(reopenBtn);
  } else {
    document.body.appendChild(reopenBtn); // fallback
  }

  function updateSidebarState() {
    aside.classList.toggle("aside-collapsed", collapsed);
    toggleBtn.innerText = collapsed ? "»" : "«";
    localStorage.setItem("sidebarCollapsed", collapsed);
    reopenBtn.style.display = collapsed ? "block" : "none";
  }

  toggleBtn.addEventListener("click", function () {
    collapsed = !collapsed;
    updateSidebarState();
  });

  reopenBtn.addEventListener("click", function () {
    collapsed = false;
    updateSidebarState();
  });

  // On resize, check if the toggle is visible and update reopen button
  window.addEventListener("resize", updateSidebarState);

  // Initial state
  updateSidebarState();
});

function showError(message) {
  const mapDiv = document.getElementById("map");
  mapDiv.innerHTML = `<div style='padding:2rem;text-align:center;color:#b00;font-weight:bold;font-size:1.2rem;'>${message}<br><br><a href='https://www.ttc.ca/service-alerts' target='_blank' style='color:#da251d;text-decoration:underline;'>Check the official TTC Service Alerts</a></div>`;
}

// Initialize the map
function initMap() {
  map = L.map("map").setView([43.665, -79.385], 12); // Centered on Toronto

  // Lock map to Toronto city bounds (tight bounding box)
  var torontoCityBounds = L.latLngBounds(
    [43.581, -79.639], // Southwest (approximate city limit)
    [43.855, -79.115]  // Northeast (approximate city limit)
  );
  map.setMaxBounds(torontoCityBounds);
  map.options.minZoom = 11;
  map.options.maxZoom = 19;

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Clear the active zones list before drawing
  document.getElementById("active-zones-list").innerHTML = "";

  // Load regular lines and render RSZs from static files only
  Promise.all([
    fetch("lines/line1.json").then(r => r.json()),
    fetch("lines/line2.json").then(r => r.json()),
    fetch("lines/line4.json").then(r => r.json())
  ]).then(([line1, line2, line4]) => {
    drawLineGeoJson(line1, "Line 1");
    drawLineGeoJson(line2, "Line 2");
    drawLineGeoJson(line4, "Line 4");
    // If no RSZs found, show a message
    if (!document.getElementById("active-zones-list").hasChildNodes()) {
      document.getElementById("active-zones-list").innerHTML = "<li>No active reduced speed zones found.</li>";
    }
  }).catch(err => {
    showError("There was a problem loading subway line data. Please check the TTC's list for the latest information.");
  });
}

// Draw regular TTC lines from GeoJSON
function drawLineGeoJson(geojson, lineKey) {
  // Official TTC line colors
  const lineColors = {
    "Line 1": "#F8C300",
    "Line 2": "#00923F",
    "Line 4": "#A21A68"
  };
  // Lighter/transparent version for regular service
  const lineColorsRegular = {
    "Line 1": "rgba(248,195,0,0.4)",
    "Line 2": "rgba(0,146,63,0.4)",
    "Line 4": "rgba(162,26,104,0.4)"
  };
  const layer = L.geoJSON(geojson, {
    filter: f => f.properties.type === "tracks" || f.properties.type === "rsz",
    style: f => {
      if (f.properties.type === "rsz") {
        return {
          color: lineColors[lineKey] || "#888",
          weight: 7,
          opacity: 0.9
        };
      } else {
        return {
          color: lineColorsRegular[lineKey] || "#888",
          weight: 5,
          opacity: 0.7
        };
      }
    },
    onEachFeature: (feature, layer) => {
      if (feature.properties.type === "rsz") {
        // Add popup for RSZ
        let popupContent = `<h3>Reduced Speed Zone</h3>
          <strong>Line:</strong> ${lineKey}<br>
          <strong>Direction:</strong> ${feature.properties.direction || "N/A"}<br>
          <strong>Between:</strong> ${feature.properties.start_station} and ${feature.properties.end_station}<br>
          <strong>Reduced Speed:</strong> ${feature.properties.speed_kph} km/h<br>
          <strong>Reason:</strong> ${feature.properties.reason}`;
        layer.bindPopup(popupContent);
        // Add to active zones list
        addZoneToList({
          properties: {
            line: lineKey,
            direction: feature.properties.direction,
            start_station: feature.properties.start_station,
            end_station: feature.properties.end_station,
            speed_kph: feature.properties.speed_kph,
            reason: feature.properties.reason
          }
        }, layer);
      }
    }
  });

  geoJsonLayers[lineKey] = layer;
  layer.addTo(map);
}

// Add a zone to the sidebar list
function addZoneToList(feature, layer) {
  const list = document.getElementById("active-zones-list");
  const listItem = document.createElement("li");
  listItem.innerHTML = `<strong>${feature.properties.line}</strong>
                          <span>${feature.properties.start_station} &harr; ${feature.properties.end_station}</span>`;
  listItem.onclick = () => {
    map.fitBounds(layer.getBounds().pad(0.2)); // Zoom to the zone
    layer.openPopup();
  };
  list.appendChild(listItem);
}

// Initialize the map when the DOM is ready
document.addEventListener("DOMContentLoaded", initMap);

// Filter Logic
document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    const line = button.dataset.line;
    button.classList.toggle('active');
    const isActive = button.classList.contains('active');

    if (geoJsonLayers[line]) {
      if (isActive) {
        map.addLayer(geoJsonLayers[line]);
      } else {
        map.removeLayer(geoJsonLayers[line]);
      }
    }
  });
});