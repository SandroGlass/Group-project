// Data Constants
const warheadsData1994 = [
    { country: "Russia", warheads: 18139 },
    { country: "United States", warheads: 10979 },
    { country: "Ukraine", warheads: 1700 },
    { country: "Kazakhstan", warheads: 1400 },
    { country: "France", warheads: 510 },
    { country: "United Kingdom", warheads: 250 },
    { country: "China", warheads: 234 },
    { country: "Belarus", warheads: 100 },
    { country: "Israel", warheads: 62 }
];

const warheadsData2001 = [
    { country: "Russia", warheads: 11152 },
    { country: "United States", warheads: 10526 },
    { country: "France", warheads: 350 },
    { country: "United Kingdom", warheads: 280 },
    { country: "China", warheads: 235 },
    { country: "Israel", warheads: 74 },
    { country: "Pakistan", warheads: 20 },
    { country: "India", warheads: 18 }
];

const facilityTypes = {
    "Nuclear power plant": { color: "#e63946", radius: 7, category: "nuclear-power" },
    "Strategic missile divisions": { color: "#4895ef", radius: 7, category: "missiles" },
    "Missile Army": { color: "#780000", radius: 6, category: "missiles" },
    "Major military-industrial enterprise": { color: "#fb8500", radius: 6, category: "industrial" },
    "HQ Black Sea Fleet": { color: "#2a9d8f", radius: 6, category: "military" },
    "Strategic aviation": { color: "#6a994e", radius: 6, category: "aviation" },
    "Nuclear research institute": { color: "#9b5de5", radius: 6, category: "research" },
    "Nuclear warhead storage": { color: "#bc6c25", radius: 7, category: "warheads" },
};

let facilityData = [];
let map, tooltip;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function () {
    // Reset scroll position
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Create star background
    createStarBackground();

    // Setup intersections 
    setupScrollObservers();

    // Initialize data and visualizations
    loadFacilityData()
        .then(() => {
            initMap();
            initScrollama();
            createWarheadsCharts();
            initCounters();
            initMapToggle();
        })
        .catch(error => {
            console.error('Error loading facility data:', error);
            document.body.innerHTML += `
                <div style="color: red; padding: 20px; background: rgba(0,0,0,0.7); 
                    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    border-radius: 10px;">
                    Error loading facility data. Please check console for details.
                </div>`;
        });

    // Handle resize events
    window.addEventListener('resize', debounce(function () {
        if (window.scroller) window.scroller.resize();

        // Redraw charts on resize
        document.querySelectorAll('.chart-container').forEach(container => {
            if (container.__chart__) {
                updateChart(container, container.__chart__.data);
            }
        });
    }, 250));
});

// Create starry background
function createStarBackground() {
    const starsContainer = document.getElementById('stars');
    const numberOfStars = 100;

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Random position
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;

        // Random size
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        // Random twinkle delay
        star.style.animationDelay = `${Math.random() * 4}s`;

        starsContainer.appendChild(star);
    }
}

// Initialize counter animations
function initCounters() {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counterId = entry.target.id;
                let targetValue = 0;

                if (counterId === 'counter-warheads') {
                    targetValue = 1700;
                } else if (counterId === 'counter-zero') {
                    targetValue = 0;
                }

                animateCounter(entry.target, targetValue);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter').forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Animate counter from 0 to target value
function animateCounter(element, targetValue) {
    let startValue = 0;
    let duration = 2000;
    let startTime = null;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;

        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentValue = Math.floor(progress * targetValue);

        element.textContent = currentValue.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = targetValue.toLocaleString();
        }
    }

    requestAnimationFrame(animate);
}

// Setup scroll observers for animations
function setupScrollObservers() {
    const animatedElements = document.querySelectorAll('.data-content, .chart-container, .transition-content, .outro__inner');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    animatedElements.forEach(el => observer.observe(el));
}

// Debounce function for resize events
function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Load facility data from CSV
function loadFacilityData() {
    return new Promise((resolve, reject) => {
        d3.csv('Ukraine-nuclear-coordinates.csv')
            .then(data => {
                facilityData = data.map(d => ({
                    address: d.address,
                    lat: +d.lat,
                    lon: +d.lon,
                    type: d.type
                }));
                console.log('Loaded facility data:', facilityData);
                resolve();
            })
            .catch(error => {
                console.error('Error loading CSV:', error);
                reject(error);
            });
    });
}

// Initialize scrollama for the map section
// Better Scrollama Setup For Mobile
function initScrollama() {
    window.scroller = scrollama();

    // Different offset based on device
    const mobileOffset = window.innerWidth < 480 ? 0.7 : 0.65;
    const desktopOffset = 0.5;

    window.scroller
        .setup({
            step: '.step',
            offset: window.innerWidth < 768 ? mobileOffset : desktopOffset, // Much higher offset on mobile
            debug: false
        })
        .onStepEnter(response => {
            // Add active class to current step
            response.element.classList.add('is-active');

            // Update map to show relevant facilities
            updateMap(response.element.dataset.step);
        })
        .onStepExit(response => {
            // Remove active class when leaving step
            response.element.classList.remove('is-active');
        });
}

// Better mobile map update approach
function updateMap(step) {
    // Dim all facilities
    map.selectAll('.facility')
        .transition()
        .duration(500)
        .attr('opacity', 0.2)
        .attr('r', d => {
            const isMobile = window.innerWidth < 768;
            // Keep dots larger on mobile even when dimmed
            const baseRadius = facilityTypes[d.type]?.radius || 5;
            return baseRadius * (isMobile ? 0.9 : 0.8);
        });

    // If 'all' step, show all facilities
    if (step === 'all') {
        map.selectAll('.facility')
            .transition()
            .duration(500)
            .attr('opacity', 0.9) // More visible
            .attr('r', d => {
                const isMobile = window.innerWidth < 768;
                const baseRadius = facilityTypes[d.type]?.radius || 5;
                // Much larger on mobile for better visibility
                return baseRadius * (isMobile ? 1.8 : 1.2);
            });
    }
    // Otherwise highlight only facilities of the current step's category
    else {
        map.selectAll(`.facility.${step}`)
            .transition()
            .duration(500)
            .attr('opacity', 1)
            .attr('r', d => {
                const isMobile = window.innerWidth < 768;
                const baseRadius = facilityTypes[d.type]?.radius || 5;
                // Highlighted dots are even larger
                return baseRadius * (isMobile ? 2.2 : 1.5);
            });
    }
}

// Create warheads charts
function createWarheadsCharts() {
    createWarheadsChart('#chart-container-1994', warheadsData1994);
    createWarheadsChart('#chart-container-2001', warheadsData2001);
}

function createWarheadsChart(containerId, data) {
    const container = document.querySelector(containerId);
    if (!container) return;

    // Sort data by warheads count descending
    const sortedData = [...data].sort((a, b) => b.warheads - a.warheads);

    const isMobile = window.innerWidth < 768;

    // Better margins for mobile
    const margin = isMobile ?
        { top: 30, right: 15, bottom: 10, left: 80 } :
        { top: 60, right: 60, bottom: 20, left: 120 };

    // Calculate width and height based on container size
    const containerWidth = container.clientWidth;
    const width = Math.max(0, containerWidth - margin.left - margin.right);
    const height = isMobile ? 380 : 450;

    // Clear container
    container.innerHTML = '';

    // Create SVG with proper responsive attributes
    const svg = d3.select(containerId)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('max-width', '100%'); // Ensure it's responsive

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(sortedData, d => d.warheads) * 1.05]) // Slight padding
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(sortedData.map(d => d.country))
        .range([0, height])
        .padding(0.2);

    // Add title - smaller on mobile
    g.append('text')
        .attr('x', width / 2)
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .style('font-size', isMobile ? '12px' : '18px')
        .style('font-weight', 'bold')
        .style('fill', 'rgba(255, 255, 255, 0.95)')
        .text('Number of Nuclear Warheads');

    // Create bars
    const bars = g.selectAll('.bar')
        .data(sortedData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => y(d.country))
        .attr('height', y.bandwidth())
        .attr('width', 0) // Start at 0 width for animation
        .attr('fill', d => {
            if (d.country === 'Ukraine') return '#FFD700';
            if (d.country === 'United States') return '#4682B4';
            if (d.country === 'Russia') return '#e63946';
            return 'rgba(150, 150, 150, 0.7)';
        })
        .attr('rx', 3)
        .attr('ry', 3);

    // Country labels - adjusted for mobile
    g.selectAll('.country-label')
        .data(sortedData)
        .enter()
        .append('text')
        .attr('class', 'country-label')
        .attr('x', -5) // Closer to bars on mobile
        .attr('y', d => y(d.country) + y.bandwidth() / 2)
        .attr('text-anchor', 'end')
        .attr('alignment-baseline', 'middle')
        .style('font-size', isMobile ? '10px' : '14px')
        .style('fill', 'rgba(255, 255, 255, 0.95)')
        .text(d => {
            // Truncate long country names on mobile
            if (isMobile && d.country.length > 8) {
                return d.country.substring(0, 7) + '..';
            }
            return d.country;
        })
        .style('font-weight', d => d.country === 'Ukraine' ? 'bold' : 'normal');

    // Warhead count labels
    const warheadLabels = g.selectAll('.warhead-label')
        .data(sortedData)
        .enter()
        .append('text')
        .attr('class', 'warhead-label')
        .attr('x', d => Math.min(x(d.warheads) + 5, width - 5)) // Keep within bounds
        .attr('y', d => y(d.country) + y.bandwidth() / 2)
        .attr('text-anchor', 'start')
        .attr('alignment-baseline', 'middle')
        .style('font-size', isMobile ? '10px' : '14px')
        .style('fill', 'rgba(255, 255, 255, 0.95)')
        .text(d => isMobile ? d.warheads : d.warheads.toLocaleString())
        .style('opacity', 0); // Start invisible for animation

    // Store chart data for resizing
    container.__chart__ = {
        data: sortedData,
        x: x,
        y: y,
        width: width,
        height: height,
        margin: margin
    };

    // Animate chart when it becomes visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate bars
                bars.transition()
                    .duration(1000)
                    .delay((d, i) => i * 50)
                    .attr('width', d => Math.min(x(d.warheads), width - 5))
                    .attr('opacity', 0.85);

                // Fade in labels
                warheadLabels.transition()
                    .delay((d, i) => i * 50 + 1000)
                    .duration(300)
                    .style('opacity', 1);

                observer.unobserve(container);
            }
        });
    }, { threshold: 0.2 });

    observer.observe(container);

    // Handle window resizes
    window.addEventListener('resize', debounce(() => {
        // Only update if container still exists and dimensions changed
        if (container && container.clientWidth !== containerWidth) {
            createWarheadsChart(containerId, data);
        }
    }, 300));
}

// Enhanced map initialization for improved mobile display
function initMap() {
    const mapContainer = document.getElementById('map-container');

    // Almost no margins for maximum space utilization
    const margin = { top: 2, right: 2, bottom: 2, left: 2 };

    // Get container dimensions
    let width = mapContainer.clientWidth - margin.left - margin.right;
    let height = mapContainer.clientHeight - margin.top - margin.bottom;

    // Clear existing map
    mapContainer.innerHTML = '';

    const svg = d3.select('#map-container')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    map = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Check if we're on mobile
    const isMobile = window.innerWidth < 768;
    const isSmallMobile = window.innerWidth < 480;

    // Enhanced projection for Ukraine - better centered and zoomed especially for mobile
    const projection = d3.geoMercator()
        .center([31.5, 48.5]) // Better centered on Ukraine
        .scale(isMobile ? width * 4.5 : width * 2.8) // Significantly larger scale for mobile
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Load world map data
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then(function (world) {
            const countries = topojson.feature(world, world.objects.countries).features;

            // Draw all countries with better contrast on mobile
            map.selectAll('.country')
                .data(countries)
                .enter()
                .append('path')
                .attr('class', 'country')
                .attr('d', path)
                .attr('fill', isMobile ? '#2a2a2a' : '#1e1e1e'); // Lighter on mobile

            // Highlight Ukraine with enhanced visibility
            const ukraine = countries.find(d => d.id === 804);
            if (ukraine) {
                map.append('path')
                    .datum(ukraine)
                    .attr('class', 'ukraine')
                    .attr('d', path)
                    .attr('fill', isMobile ? '#333' : '#292929')
                    .attr('stroke-width', isMobile ? '2px' : '3px');
            }

            // Label Russia - smaller or hidden on smaller screens
            const russia = countries.find(d => d.id === 643);
            if (russia && !isSmallMobile) {
                const russiaBounds = path.bounds(russia);
                // Better positioned label
                const russiaCentroid = [
                    (russiaBounds[0][0] + russiaBounds[1][0]) / 2,
                    (russiaBounds[0][1] + russiaBounds[1][1]) / 2 - 20
                ];

                map.append('text')
                    .attr('x', russiaCentroid[0])
                    .attr('y', russiaCentroid[1])
                    .attr('text-anchor', 'middle')
                    .style('font-size', isMobile ? '11px' : '16px')
                    .style('fill', 'rgba(255, 255, 255, 0.9)')
                    .style('font-weight', 'bold')
                    .style('stroke', '#1e1e1e')
                    .style('stroke-width', '0.5px')
                    .text('Russia');
            }

            // Add facilities with enhanced mobile visibility
            addFacilities(projection);

            // Add compact legend for mobile
            addMobileFriendlyLegend(isMobile);

            // Enhanced window resize handler
            window.addEventListener('resize', debounce(function () {
                // Completely rebuild for best results on resize
                initMap();
            }, 250));
        })
        .catch(function (error) {
            console.error('Error loading TopoJSON:', error);
            mapContainer.innerHTML = `<div style="color: red; padding: 20px;">Error loading map data. Please check console.</div>`;
        });

    // Initialize tooltip
    tooltip = d3.select('#tooltip');
}

// Helper function to update map elements on resize
function updateMapElements(projection, path, russia) {
    const isMobile = window.innerWidth < 768;

    // Update paths
    map.selectAll('path').attr('d', path);

    // Update facility positions with better sizing
    map.selectAll('.facility')
        .attr('cx', d => {
            const coords = projection([d.lon, d.lat]);
            return coords ? coords[0] : 0;
        })
        .attr('cy', d => {
            const coords = projection([d.lon, d.lat]);
            return coords ? coords[1] : 0;
        })
        .attr('r', d => {
            // Adjust circle size based on screen size
            const baseRadius = facilityTypes[d.type]?.radius || 5;
            return isMobile ? baseRadius * 1.2 : baseRadius;
        });

    // Update Russia label position if russia data is available
    if (russia) {
        const russiaBounds = path.bounds(russia);
        const russiaCentroid = [
            (russiaBounds[0][0] + russiaBounds[1][0]) / 2,
            (russiaBounds[0][1] + russiaBounds[1][1]) / 2 - 30
        ];

        map.selectAll('text')
            .filter(function () { return this.textContent === 'Russia'; })
            .attr('x', russiaCentroid[0])
            .attr('y', russiaCentroid[1])
            .style('font-size', isMobile ? '12px' : '16px');
    }

    // Update legend position
    updateLegendPosition();
}

function addFacilities(projection) {
    if (facilityData.length === 0) {
        console.error('No facility data available to display');
        return;
    }

    // Filter out invalid coordinates
    const validData = facilityData.filter(d =>
        !isNaN(d.lat) && !isNaN(d.lon) && d.lat !== null && d.lon !== null
    );

    const isMobile = window.innerWidth < 768;

    // Create facilities with enhanced visibility for mobile
    map.selectAll('.facility')
        .data(validData)
        .enter()
        .append('circle')
        .attr('class', d => {
            const category = getFacilityCategory(d.type);
            return `facility ${category}`;
        })
        .attr('cx', d => {
            const coords = projection([d.lon, d.lat]);
            if (!coords) {
                console.warn('Invalid projection for:', d);
                return 0;
            }
            return coords[0];
        })
        .attr('cy', d => {
            const coords = projection([d.lon, d.lat]);
            if (!coords) return 0;
            return coords[1];
        })
        .attr('r', d => {
            // Much larger size for better mobile visibility
            const radius = facilityTypes[d.type]?.radius || 5;
            return radius * (isMobile ? 2.0 : 1.2);
        })
        .attr('fill', d => facilityTypes[d.type]?.color || '#999')
        .attr('stroke', 'rgba(255, 255, 255, 0.9)')
        .attr('stroke-width', isMobile ? 1.5 : 0.8) // Thicker outline for mobile
        .attr('opacity', 0.95)
        .on('mouseover', function (event, d) {
            // Better positioned and styled tooltip for mobile
            tooltip.html(`<strong>${d.address}</strong><br>Type: ${d.type}`)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 25}px`)
                .style('opacity', 1)
                .style('z-index', 1000);

            d3.select(this)
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .attr('r', d => {
                    const radius = facilityTypes[d.type]?.radius || 5;
                    return radius * (isMobile ? 2.5 : 1.8);
                });
        })
        .on('mouseout', function () {
            tooltip.style('opacity', 0);

            d3.select(this)
                .attr('stroke', 'rgba(255, 255, 255, 0.9)')
                .attr('stroke-width', isMobile ? 1.5 : 0.8)
                .attr('r', d => {
                    const radius = facilityTypes[d.type]?.radius || 5;
                    return radius * (isMobile ? 2.0 : 1.2);
                });
        });
}
// Simplified, more compact legend for mobile
function addMobileFriendlyLegend(isMobile) {
    // First check if legend already exists and remove if so
    map.selectAll('.legend').remove();

    // Get unique facility types from the data
    const uniqueTypes = Array.from(new Set(facilityData.map(d => d.type)));

    // For very small screens, we might want to limit the legend entries
    const legendEntries = isMobile && window.innerWidth < 400 ?
        uniqueTypes.slice(0, 5) : uniqueTypes;

    const legend = map.append('g')
        .attr('class', 'legend');

    // More compact background for mobile
    legend.append('rect')
        .attr('x', -8)
        .attr('y', -8)
        .attr('width', isMobile ? 140 : 200)
        .attr('height', legendEntries.length * (isMobile ? 12 : 14) + 16)
        .attr('fill', 'rgba(20, 20, 20, 0.92)')
        .attr('opacity', 0.95)
        .attr('rx', 6);

    // Add title
    legend.append('text')
        .attr('x', 0)
        .attr('y', 4)
        .text('Facility Types')
        .style('font-weight', 'bold')
        .style('font-size', isMobile ? '9px' : '12px')
        .style('fill', 'rgba(255, 255, 255, 0.95)');

    // Add legend items with more compact spacing on mobile
    const legendItems = legend.selectAll('.legend-item')
        .data(legendEntries)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * (isMobile ? 12 : 14) + 16})`);

    // Add colored dots - smaller on mobile
    legendItems.append('circle')
        .attr('cx', 7)
        .attr('cy', 0)
        .attr('r', isMobile ? 4 : 5)
        .attr('fill', d => facilityTypes[d]?.color || '#999');

    // Add labels with smaller, truncated text on mobile
    legendItems.append('text')
        .attr('x', 16)
        .attr('y', 3)
        .text(d => {
            if (isMobile) {
                // Truncate long facility names on mobile
                if (d.length > 15) {
                    return d.substring(0, 12) + '...';
                } else {
                    return d;
                }
            } else {
                return d;
            }
        })
        .style('font-size', isMobile ? '8px' : '11px')
        .style('fill', 'rgba(255, 255, 255, 0.9)');

    // Position legend for better mobile visibility
    const mapContainer = document.getElementById('map-container');
    const width = mapContainer.clientWidth;
    const height = mapContainer.clientHeight;

    if (isMobile) {
        // For mobile: compact at top right
        legend.attr('transform', `translate(${width - 145}, 15)`)
            .classed('legend-fixed-position', true);
    } else {
        // For desktop: bottom right
        legend.attr('transform', `translate(${width - 210}, ${height - 230})`)
            .classed('legend-fixed-position', false);
    }

    // If mobile and there are more types than shown, add an indicator
    if (isMobile && window.innerWidth < 400 && uniqueTypes.length > 5) {
        legend.append('text')
            .attr('x', 7)
            .attr('y', legendEntries.length * 12 + 18)
            .text(`+ ${uniqueTypes.length - 5} more types`)
            .style('font-size', '7px')
            .style('font-style', 'italic')
            .style('fill', 'rgba(255, 255, 255, 0.7)');
    }
}

// Get category for a facility type
function getFacilityCategory(type) {
    if (!facilityTypes[type]) {
        console.warn(`Facility type not found in mapping: "${type}"`);
        return 'other';
    }
    return facilityTypes[type].category || 'other';
}

// Improved map legend
function addMapLegend() {
    // First check if legend already exists and remove if so
    map.selectAll('.legend').remove();

    // Get unique facility types from the data
    const uniqueTypes = Array.from(new Set(facilityData.map(d => d.type)));
    const isMobile = window.innerWidth < 768;

    const legend = map.append('g')
        .attr('class', 'legend');

    // Add background rectangle with better styling
    legend.append('rect')
        .attr('x', -10)
        .attr('y', -10)
        .attr('width', isMobile ? 160 : 200)
        .attr('height', uniqueTypes.length * 14 + 20)
        .attr('fill', 'rgba(20, 20, 20, 0.92)')
        .attr('opacity', 0.95)
        .attr('rx', 8);

    // Add title
    legend.append('text')
        .attr('x', 0)
        .attr('y', 4)
        .text('Facility Types')
        .style('font-weight', 'bold')
        .style('font-size', isMobile ? '10px' : '12px')
        .style('fill', 'rgba(255, 255, 255, 0.95)');

    // Add legend items with better spacing
    const legendItems = legend.selectAll('.legend-item')
        .data(uniqueTypes)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 14 + 18})`);

    // Add colored dots
    legendItems.append('circle')
        .attr('cx', 8)
        .attr('cy', 0)
        .attr('r', 5)
        .attr('fill', d => facilityTypes[d]?.color || '#999');

    // Add labels with better font sizing
    legendItems.append('text')
        .attr('x', 18)
        .attr('y', 3)
        .text(d => isMobile && d.length > 18 ? d.substring(0, 15) + '...' : d)
        .style('font-size', isMobile ? '9px' : '11px')
        .style('fill', 'rgba(255, 255, 255, 0.9)');

    // Position legend with better placement
    updateLegendPosition();
}

// Helper to update legend position based on screen size
function updateLegendPosition() {
    const mapContainer = document.getElementById('map-container');
    const width = mapContainer.clientWidth;
    const height = mapContainer.clientHeight;
    const legend = map.select('.legend');

    if (!legend.empty()) {
        if (window.innerWidth < 768) {
            // For mobile: top right with padding
            legend.attr('transform', `translate(${width - 165}, 15)`)
                .classed('legend-fixed-position', true);
        } else {
            // For desktop: bottom right with padding
            legend.attr('transform', `translate(${width - 210}, ${height - 230})`)
                .classed('legend-fixed-position', false);
        }
    }
}

// Update map based on current step
function updateMap(step) {
    // Dim all facilities
    map.selectAll('.facility')
        .transition()
        .duration(500)
        .attr('opacity', 0.2)
        .attr('r', d => (facilityTypes[d.type]?.radius || 5) * 0.8 /
            (window.innerWidth < 768 ? 1.5 : 1));

    // If 'all' step, show all facilities
    if (step === 'all') {
        map.selectAll('.facility')
            .transition()
            .duration(500)
            .attr('opacity', 0.8)
            .attr('r', d => (facilityTypes[d.type]?.radius || 5) /
                (window.innerWidth < 768 ? 1.5 : 1));
    }
    // Otherwise highlight only facilities of the current step's category
    else {
        map.selectAll(`.facility.${step}`)
            .transition()
            .duration(500)
            .attr('opacity', 1)
            .attr('r', d => (facilityTypes[d.type]?.radius || 5) * 1.3 /
                (window.innerWidth < 768 ? 1.5 : 1));
    }
}

// Improved map toggle functionality for mobile
// More effective mobile map toggle functionality
function initMapToggle() {
    const mapToggle = document.getElementById('map-toggle');
    const mainElement = document.querySelector('main');
    const mapContainer = document.querySelector('.sticky-thing');
    const articleSection = document.querySelector('article');

    if (mapToggle && mapContainer && articleSection) {
        // Only enable toggle on mobile devices
        if (window.innerWidth >= 768) {
            mapToggle.style.display = 'none';
            return;
        }

        // Make toggle more visible and prominent
        mapToggle.style.width = '55px';
        mapToggle.style.height = '55px';
        mapToggle.style.backgroundColor = 'rgba(25, 25, 25, 0.9)';
        mapToggle.style.border = '2px solid rgba(255, 215, 0, 0.5)';

        // Set initial heights based on screen size
        const defaultMobileMapHeight = window.innerWidth < 480 ? '65vh' : '70vh';
        const expandedMapHeight = '90vh';

        // Set initial map height
        mapContainer.style.height = defaultMobileMapHeight;

        mapToggle.addEventListener('click', function () {
            // Toggle expanded state
            const isExpanded = mainElement.classList.toggle('map-expanded');

            if (isExpanded) {
                // Expand map to almost full screen
                mapContainer.style.height = expandedMapHeight;
                articleSection.style.paddingTop = expandedMapHeight;

                // Make steps semi-transparent but still visible
                document.querySelectorAll('.step').forEach(step => {
                    step.style.backgroundColor = 'rgba(20, 20, 20, 0.95)';
                });

                // Update button icon to X
                mapToggle.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                `;

                // Show message that user can scroll content
                showToast("Map expanded. Scroll to view text.");
            } else {
                // Restore original layout
                mapContainer.style.height = defaultMobileMapHeight;
                articleSection.style.paddingTop = '2rem';

                // Reset step styles
                document.querySelectorAll('.step').forEach(step => {
                    step.style.backgroundColor = '';
                });

                // Update button icon to map pin
                mapToggle.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                `;
            }

            // Refresh map and scrollama after toggle
            setTimeout(() => {
                // Refresh the map
                initMap();

                // Refresh scrollama
                if (window.scroller) {
                    window.scroller.resize();
                }
            }, 300);
        });

        // Show initial tooltip about toggle
        setTimeout(() => {
            showToast("Tap the map icon to expand view");
        }, 2000);
    }
}

// Enhanced toast messages
function showToast(message) {
    // Remove any existing toast
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }

    // Create new toast with better styling
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = message;
    toast.style.backgroundColor = 'rgba(20, 20, 20, 0.95)';
    toast.style.color = 'white';
    toast.style.border = '1px solid rgba(255, 215, 0, 0.4)';
    toast.style.borderRadius = '20px';
    toast.style.padding = '10px 20px';
    toast.style.position = 'fixed';
    toast.style.bottom = '80px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.zIndex = '2000';
    toast.style.fontSize = '14px';
    toast.style.boxShadow = '0 3px 15px rgba(0, 0, 0, 0.5)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.whiteSpace = 'nowrap';

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);

    // Fade out and remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Helper function to show toast messages
function showToast(message) {
    // Check if there's already a toast
    let toast = document.querySelector('.toast-message');

    if (!toast) {
        // Create new toast
        toast = document.createElement('div');
        toast.className = 'toast-message';
        document.body.appendChild(toast);
    }

    // Set message and show toast
    toast.textContent = message;
    toast.classList.add('visible');

    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}