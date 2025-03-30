// Type colors mapping
const typeColors = {
    "Nuclear power plant": "#ff4d4d",
    "Strategic missile divisions": "#ff9900",
    "Major military-industrial enterprise": "#4d94ff",
    "Missile Army": "#cc00cc",
    "HQ Black Sea Fleet": "#0066cc",
    "Strategic aviation": "#33cc33",
    "Nuclear research institute": "#9966ff",
    "Nuclear warhead storage": "#ffcc00"
};

// Main map container
const mapContainer = document.getElementById('map-container');
let ukraineGeoData = null;
let nuclearData = [];
let hoveredPoint = null;
let tooltip = null;

// SVG dimensions
const width = mapContainer.clientWidth;
const height = mapContainer.clientHeight;

// Create the SVG element
const svg = d3.select(mapContainer)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

// Create a title box
const titleBox = document.createElement('div');
titleBox.className = 'title-box';
titleBox.innerHTML = '<h2>In 1994, Ukraine had over 10 military nuclear facilities</h2>';
mapContainer.appendChild(titleBox);

// Initialize tooltip
function createTooltip() {
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.style.display = 'none';
    mapContainer.appendChild(tooltip);
}

// Show tooltip function
function showTooltip(point, x, y) {
    tooltip.innerHTML = `<p>${point.address}</p><p>${point.type}</p>`;
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y - 60}px`;
    tooltip.style.display = 'block';
}

// Hide tooltip function
function hideTooltip() {
    tooltip.style.display = 'none';
}

// Create the legend
function createLegend() {
    const legend = document.createElement('div');
    legend.className = 'legend';

    let legendHTML = '<h3>Facility Types</h3>';

    for (const type in typeColors) {
        legendHTML += `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${typeColors[type]}"></div>
                <span>${type}</span>
            </div>
        `;
    }

    legend.innerHTML = legendHTML;
    mapContainer.appendChild(legend);
}

// Ukraine GeoJSON data - hardcoded to avoid CORS issues
const ukraineGeoJsonData = {
    "type": "Feature",
    "properties": {
        "name": "Ukraine",
        "code": "UKR",
        "group": "Countries"
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [
            [
                [31.785998, 52.101678], [32.159412, 52.061267], [32.412058, 52.288695],
                [32.715761, 52.238465], [33.7527, 52.335075], [34.391731, 51.768882],
                [34.141978, 51.566413], [34.224816, 51.255993], [35.022183, 51.207572],
                [35.377924, 50.773955], [35.356116, 50.577197], [36.626168, 50.225591],
                [37.39346, 50.383953], [38.010631, 49.915662], [38.594988, 49.926462],
                [40.069058, 49.601055], [40.080789, 49.30743], [39.674664, 48.783818],
                [39.895632, 48.232405], [39.738278, 47.898937], [38.770585, 47.825608],
                [38.255112, 47.5464], [38.223538, 47.10219], [37.425137, 47.022221],
                [36.759855, 46.6987], [35.823685, 46.645964], [34.962342, 46.273197],
                [35.020788, 45.651219], [35.510009, 45.409993], [36.529998, 45.46999],
                [36.334713, 45.113216], [35.239999, 44.939996], [33.882511, 44.361479],
                [33.326421, 44.564877], [33.546924, 45.034771], [32.454174, 45.327466],
                [32.630804, 45.519186], [33.588162, 45.851569], [33.298567, 46.080598],
                [31.74414, 46.333348], [31.675307, 46.706245], [30.748749, 46.5831],
                [30.377609, 46.03241], [29.603289, 45.293308], [29.149725, 45.464925],
                [28.679779, 45.304031], [28.233554, 45.488283], [28.485269, 45.596907],
                [28.659987, 45.939987], [28.933717, 46.25883], [28.862972, 46.437889],
                [29.072107, 46.517678], [29.170654, 46.379262], [29.759972, 46.349988],
                [30.024659, 46.423937], [29.83821, 46.525326], [29.908852, 46.674361],
                [29.559674, 46.928583], [29.415135, 47.346645], [29.050868, 47.510227],
                [29.122698, 47.849095], [28.670891, 48.118149], [28.259547, 48.155562],
                [27.522537, 48.467119], [26.857824, 48.368211], [26.619337, 48.220726],
                [26.19745, 48.220881], [25.945941, 47.987149], [25.207743, 47.891056],
                [24.866317, 47.737526], [24.402056, 47.981878], [23.760958, 47.985598],
                [23.142236, 48.096341], [22.710531, 47.882194], [22.64082, 48.15024],
                [22.085608, 48.422264], [22.280842, 48.825392], [22.558138, 49.085738],
                [22.776419, 49.027395], [22.51845, 49.476774], [23.426508, 50.308506],
                [23.922757, 50.424881], [24.029986, 50.705407], [23.527071, 51.578454],
                [24.005078, 51.617444], [24.553106, 51.888461], [25.327788, 51.910656],
                [26.337959, 51.832289], [27.454066, 51.592303], [28.241615, 51.572227],
                [28.617613, 51.427714], [28.992835, 51.602044], [29.254938, 51.368234],
                [30.157364, 51.416138], [30.555117, 51.319503], [30.619454, 51.822806],
                [30.927549, 52.042353], [31.785998, 52.101678]
            ]
        ]
    }
};

// Nuclear facilities data - hardcoded to avoid CORS issues
const nuclearFacilitiesData = [
    { "address": "Rivne", "lat": 50.61962, "lon": 26.25132, "type": "Nuclear power plant" },
    { "address": "Khmelnytskyi", "lat": 49.26862, "lon": 27.0636, "type": "Strategic missile divisions" },
    { "address": "Mykolaiv", "lat": 46.97586, "lon": 31.99397, "type": "Major military-industrial enterprise" },
    { "address": "Nadvirna", "lat": 48.63359, "lon": 24.5684, "type": "Strategic missile divisions" },
    { "address": "Vinnytsia", "lat": 49.23202, "lon": 28.46798, "type": "Missile Army" },
    { "address": "Makariv", "lat": 50.4656, "lon": 29.8142, "type": "Strategic missile divisions" },
    { "address": "Chornobyl", "lat": 51.27055, "lon": 30.21956, "type": "Nuclear power plant" },
    { "address": "Pervomaisk", "lat": 47.6816, "lon": 29.20928, "type": "Strategic missile divisions" },
    { "address": "Zaporizhia", "lat": 47.82476, "lon": 35.34002, "type": "Nuclear power plant" },
    { "address": "Sevastopol", "lat": 44.55517, "lon": 33.66208, "type": "HQ Black Sea Fleet" },
    { "address": "Dnipro", "lat": 48.46802, "lon": 35.04177, "type": "Major military-industrial enterprise" },
    { "address": "Kharkiv", "lat": 49.99232, "lon": 36.23101, "type": "Major military-industrial enterprise" },
    { "address": "Pryluky", "lat": 50.61212, "lon": 32.3873, "type": "Strategic aviation" },
    { "address": "Hostomel", "lat": 50.60483, "lon": 30.19086, "type": "Nuclear research institute" },
    { "address": "Uzyn", "lat": 49.82847, "lon": 30.41972, "type": "Strategic aviation" },
    { "address": "Tsybuleve", "lat": 48.81752, "lon": 32.47767, "type": "Nuclear warhead storage" },
    { "address": "Feodosiya", "lat": 45.03312, "lon": 35.31117, "type": "Nuclear warhead storage" },
    { "address": "Simferopol", "lat": 44.95215, "lon": 34.10249, "type": "Nuclear warhead storage" },
    { "address": "Zhovti Vody", "lat": 48.34652, "lon": 33.50278, "type": "Nuclear research institute" },
    { "address": "Dniprovska", "lat": 48.45869, "lon": 35.03619, "type": "Major military-industrial enterprise" },
    { "address": "Makariv", "lat": 50.4656, "lon": 29.8142, "type": "Nuclear warhead storage" }
];

// Initialize the map
function initMap() {
    try {
        createTooltip();

        // Use hardcoded data to avoid CORS issues
        ukraineGeoData = ukraineGeoJsonData;
        nuclearData = nuclearFacilitiesData;

        renderMap();
        createLegend();
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Render the map with the data
function renderMap() {
    // Create projection
    const projection = d3.geoMercator().fitSize([width, height], ukraineGeoData);
    const path = d3.geoPath().projection(projection);

    // Draw Ukraine outline
    svg.append('path')
        .datum(ukraineGeoData)
        .attr('class', 'ukraine-outline')
        .attr('d', path);

    // Draw nuclear facilities
    nuclearData.forEach((point, index) => {
        const [x, y] = projection([point.lon, point.lat]);

        svg.append('circle')
            .attr('class', 'facility-point')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 8)
            .attr('fill', typeColors[point.type] || '#999')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.8)
            .on('mouseenter', function (event) {
                showTooltip(point, x, y);
                d3.select(this).attr('opacity', 1);
            })
            .on('mouseleave', function () {
                hideTooltip();
                d3.select(this).attr('opacity', 0.8);
            });
    });
}

// Initialize the map on page load
document.addEventListener('DOMContentLoaded', initMap);

// Handle window resize
window.addEventListener('resize', () => {
    // Clear existing content
    svg.selectAll('*').remove();

    // Remove old elements except the original SVG
    while (mapContainer.firstChild) {
        if (mapContainer.firstChild === svg.node()) {
            mapContainer.firstChild.innerHTML = '';
            break;
        }
        mapContainer.removeChild(mapContainer.firstChild);
    }

    // Readjust SVG dimensions
    svg.attr('width', mapContainer.clientWidth)
        .attr('height', mapContainer.clientHeight);

    // Redraw the map
    renderMap();
    createLegend();
    createTooltip();

    // Re-add the title
    mapContainer.appendChild(titleBox);
});