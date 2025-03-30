// Handle scrolling behavior
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};
window.addEventListener('load', function () {
    setTimeout(function () {
        window.scrollTo(0, 0);
    }, 0);
});

const scroller = scrollama();
const introScroller = scrollama();
const introSectionScroller = scrollama(); // New scroller for intro sections
let map, tooltip;
let facilityData = []; // This will be populated from the CSV

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

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing...');
    // Load the CSV data first, then initialize everything else
    loadFacilityData()
        .then(() => {
            initMap();
            initScroller();
            createWarheadsCharts();
            initIntroScroller();
            initIntroSectionScroller();
        })
        .catch(error => {
            console.error('Error loading facility data:', error);
            // Show error message to user
            document.body.innerHTML += `<div style="color: red; padding: 20px; background: rgba(0,0,0,0.7); position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 10px;">
                Error loading facility data. Please check console for details.
            </div>`;
        });

    window.addEventListener('resize', function () {
        scroller.resize();
        introScroller.resize();
        introSectionScroller.resize();
    });
});

// Load facility data from CSV
function loadFacilityData() {
    return new Promise((resolve, reject) => {
        d3.csv('Ukraine-nuclear-coordinates.csv')
            .then(data => {
                // Process the CSV data and convert numeric values
                facilityData = data.map(d => ({
                    address: d.address,
                    lat: +d.lat, // Convert string to number
                    lon: +d.lon, // Convert string to number
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

function initIntroSectionScroller() {
    // Make title visible immediately, no animation
    document.querySelector('#section-title h1').style.opacity = 1;

    // Hide title when scrolling past certain point
    window.addEventListener('scroll', function () {
        if (window.scrollY > window.innerHeight * 0.8) {
            document.querySelector('#section-title').style.opacity = '0';
        } else {
            document.querySelector('#section-title').style.opacity = '1';
        }
    });
    introSectionScroller
        .setup({
            step: '.intro-section',
            offset: 0.5, // Trigger when element is 50% in viewport
            debug: false
        })
        .onStepEnter(response => {
            const currentIndex = response.index;
            const sectionId = response.element.id;

            // Show the current section
            const fadeElement = response.element.querySelector('.fade-element');
            if (fadeElement) {
                fadeElement.classList.add('visible');
            }

            // For chart containers, make them visible on enter
            if (sectionId === 'section-chart-1') {
                document.querySelector('#chart-container-1994').classList.add('visible');
            } else if (sectionId === 'section-chart-2') {
                document.querySelector('#chart-container-2001').classList.add('visible');
            } else if (sectionId === 'section-final') {
                document.querySelector('.post-charts').classList.add('visible');
            }

            // Hide previous sections except for special cases
            if (currentIndex > 0) {
                const prevSection = document.querySelectorAll('.intro-section')[currentIndex - 1];
                const prevFadeElement = prevSection.querySelector('.fade-element');
                if (prevFadeElement) {
                    prevFadeElement.classList.remove('visible');
                }
            }

            // Hide sections that are more than one step away
            document.querySelectorAll('.intro-section').forEach((section, index) => {
                // Skip the current section and special chart sections
                if (index !== currentIndex &&
                    section.id !== 'section-chart-1' &&
                    section.id !== 'section-chart-2' &&
                    section.id !== 'section-final') {

                    const fadeEl = section.querySelector('.fade-element');
                    if (fadeEl && Math.abs(index - currentIndex) > 1) {
                        fadeEl.classList.remove('visible');
                    }
                }
            });
        })
        .onStepExit(response => {
            // Special handling for chart containers to keep them visible longer
            if (response.direction === 'down') {
                // When scrolling down, we leave them visible until the next section
                if (response.element.id === 'section-h3-1') {
                    // Keep this visible until chart 1 is fully entered
                } else if (response.element.id === 'section-h3-2') {
                    // Keep this visible until chart 2 is fully entered
                }
            } else if (response.direction === 'up') {
                // When scrolling up, hide charts immediately
                if (response.element.id === 'section-chart-1') {
                    document.querySelector('#chart-container-1994').classList.remove('visible');
                } else if (response.element.id === 'section-chart-2') {
                    document.querySelector('#chart-container-2001').classList.remove('visible');
                } else if (response.element.id === 'section-final') {
                    document.querySelector('.post-charts').classList.remove('visible');
                }
            }
        });
}

function createWarheadsCharts() {
    const chartConfigs = [
        {
            containerId: '#chart-container-1994',
            data: warheadsData1994.sort((a, b) => b.warheads - a.warheads),
            animateOnLoad: false // Changed to false so animation starts when scrolled to
        },
        {
            containerId: '#chart-container-2001',
            data: warheadsData2001.sort((a, b) => b.warheads - a.warheads),
            animateOnLoad: false
        }
    ];

    chartConfigs.forEach(config => {
        const container = document.querySelector(config.containerId);
        if (!container) return;

        const isMobile = window.innerWidth < 768;
        const margin = { top: 60, right: 60, bottom: 20, left: 120 };
        const width = Math.max(0, container.clientWidth - margin.left - margin.right);
        const height = isMobile ? 590 : 590;

        container.innerHTML = '';

        const svg = d3.select(config.containerId)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain([0, d3.max(config.data, d => d.warheads) * 1.1])
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(config.data.map(d => d.country))
            .range([0, height])
            .padding(0.2);

        g.append('text')
            .attr('x', width / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .style('font-size', isMobile ? '16px' : '20px')
            .style('font-weight', 'bold')
            .style('fill', 'aliceblue')
            .text('Number of Nuclear Warheads');

        const bars = g.selectAll('.bar')
            .data(config.data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', d => y(d.country))
            .attr('height', y.bandwidth())
            .attr('width', 0) // Start with width 0 for animation
            .attr('fill', d =>
                d.country === 'Ukraine' ? '#FFD700' :
                    d.country === 'United States' ? '#4682B4' : '#607D8B');

        g.selectAll('.country-label')
            .data(config.data)
            .enter()
            .append('text')
            .attr('x', -15)
            .attr('y', d => y(d.country) + y.bandwidth() / 2)
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'middle')
            .style('font-size', isMobile ? '12px' : '16px')
            .style('fill', 'aliceblue')
            .text(d => d.country)
            .style('font-weight', d => d.country === 'Ukraine' ? 'bold' : 'normal');

        const warheadLabels = g.selectAll('.warhead-label')
            .data(config.data)
            .enter()
            .append('text')
            .attr('x', d => x(d.warheads) + 5)
            .attr('y', d => y(d.country) + y.bandwidth() / 2)
            .attr('text-anchor', 'start')
            .attr('alignment-baseline', 'middle')
            .style('font-size', isMobile ? '12px' : '16px')
            .style('fill', 'aliceblue')
            .text(d => d.warheads.toLocaleString())
            .style('opacity', 0);

        // Animation will start when container becomes visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && container.classList.contains('visible')) {
                    bars.transition()
                        .duration(1000)
                        .delay((d, i) => i * 100)
                        .attr('width', d => x(d.warheads));

                    warheadLabels
                        .transition()
                        .delay((d, i) => i * 100 + 1000)
                        .duration(500)
                        .style('opacity', 1);

                    observer.unobserve(container);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(container);

        function updateChart() {
            const newWidth = Math.max(0, container.clientWidth - margin.left - margin.right);
            x.range([0, newWidth]);
            svg.attr('width', newWidth + margin.left + margin.right);
            bars.attr('width', d => Math.max(0, x(d.warheads)));
            warheadLabels.attr('x', d => x(d.warheads) + 5);
            g.select('text')
                .attr('x', newWidth / 2);
        }

        window.addEventListener('resize', updateChart);
    });
}

function initIntroScroller() {
    introScroller
        .setup({
            step: '.chart-container, .post-charts',
            offset: 0.7,
            debug: false
        })
        .onStepEnter(response => {
            response.element.classList.add('visible');
        });
}

function initMap() {
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const mapContainer = document.getElementById('map-container');
    let width = mapContainer.clientWidth - margin.left - margin.right;
    let height = mapContainer.clientHeight - margin.top - margin.bottom;

    const svg = d3.select('#map-container')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    map = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const projection = d3.geoMercator()
        .center([32, 49])
        .scale(width * 2.5)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then(function (world) {
            const countries = topojson.feature(world, world.objects.countries).features;

            map.selectAll('.country')
                .data(countries)
                .enter()
                .append('path')
                .attr('class', 'country')
                .attr('d', path);

            const ukraine = countries.find(d => d.id === 804);
            if (ukraine) {
                map.append('path')
                    .datum(ukraine)
                    .attr('class', 'ukraine')
                    .attr('d', path);
            }

            const russia = countries.find(d => d.id === 643);
            if (russia) {
                console.log('Russia found:', russia); // Debug log
                map.append('path')
                    .datum(russia)
                    .attr('class', 'country')
                    .attr('d', path);

                const russiaBounds = path.bounds(russia);
                const russiaCentroid = [
                    (russiaBounds[0][0] + russiaBounds[1][0]) / 2,
                    (russiaBounds[0][1] + russiaBounds[1][1]) / 2 - 30
                ];
                console.log('Russia centroid:', russiaCentroid); // Debug position
                map.append('text')
                    .attr('x', russiaCentroid[0])
                    .attr('y', russiaCentroid[1])
                    .attr('text-anchor', 'middle')
                    .style('font-size', window.innerWidth < 768 ? '14px' : '18px')
                    .style('fill', 'aliceblue')
                    .style('font-weight', 'bold')
                    .style('stroke', '#2c2d2d')
                    .style('stroke-width', '0.5px')
                    .style('z-index', '10') // Ensure it's on top
                    .text('Russia');
            } else {
                console.error('Russia not found in country data');
            }

            addFacilities(projection);
            addLegend();
        })
        .catch(function (error) {
            console.error('Error loading TopoJSON:', error);
        });

    tooltip = d3.select('#tooltip');

    function updateMapSize() {
        width = mapContainer.clientWidth - margin.left - margin.right;
        height = mapContainer.clientHeight - margin.top - margin.bottom;
        svg.attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);
        projection.scale(width * 2.5)
            .translate([width / 2, height / 2]);
        map.selectAll('path').attr('d', path);
        map.selectAll('.facility')
            .attr('cx', d => projection([d.lon, d.lat])[0])
            .attr('cy', d => projection([d.lon, d.lat])[1]);
        map.selectAll('text')
            .attr('x', function () {
                if (this.textContent === 'Russia') {
                    const russia = d3.select(this.parentNode).selectAll('.country').data().find(d => d.id === 643);
                    if (russia) {
                        const bounds = path.bounds(russia);
                        return (bounds[0][0] + bounds[1][0]) / 2;
                    }
                }
                return this.getAttribute('x');
            })
            .attr('y', function () {
                if (this.textContent === 'Russia') {
                    const russia = d3.select(this.parentNode).selectAll('.country').data().find(d => d.id === 643);
                    if (russia) {
                        const bounds = path.bounds(russia);
                        return (bounds[0][1] + bounds[1][1]) / 2 - 30;
                    }
                }
                return this.getAttribute('y');
            });
        const legendHeight = Object.keys(facilityTypes).length * 14 + 20;
        map.select('.legend')
            .attr('transform', `translate(${width - 190}, ${height - legendHeight - 10})`);
    }

    window.addEventListener('resize', updateMapSize);
}

function addFacilities(projection) {
    console.log('Adding facilities to map:', facilityData.length);

    if (facilityData.length === 0) {
        console.error('No facility data available to display');
        return;
    }

    // Filter out any items with invalid coordinates
    const validData = facilityData.filter(d => {
        const valid = !isNaN(d.lat) && !isNaN(d.lon) &&
            d.lat !== null && d.lon !== null;
        if (!valid) {
            console.warn('Skipping facility with invalid coordinates:', d);
        }
        return valid;
    });

    console.log('Valid facilities for display:', validData.length);

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
            if (!coords) {
                return 0;
            }
            return coords[1];
        })
        .attr('r', d => {
            const radius = facilityTypes[d.type]?.radius || 5;
            return radius / (window.innerWidth < 768 ? 1.5 : 1);
        })
        .attr('fill', d => facilityTypes[d.type]?.color || '#999')
        .attr('stroke', 'aliceblue')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.8)
        .on('mouseover', function (event, d) {
            tooltip.html(`<strong>${d.address}</strong><br>Type: ${d.type}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 20) + 'px')
                .style('opacity', 1);
            d3.select(this)
                .attr('stroke', 'aliceblue')
                .attr('stroke-width', 1.5)
                .attr('r', (facilityTypes[d.type]?.radius || 5) * 1.5 /
                    (window.innerWidth < 768 ? 1.5 : 1));
        })
        .on('mouseout', function () {
            tooltip.style('opacity', 0);
            d3.select(this)
                .attr('stroke', 'aliceblue')
                .attr('stroke-width', 0.5)
                .attr('r', d => (facilityTypes[d.type]?.radius || 5) /
                    (window.innerWidth < 768 ? 1.5 : 1));
        });
}

function addLegend() {
    // Get unique facility types from the data
    const uniqueTypes = Array.from(new Set(facilityData.map(d => d.type)));
    const legend = map.append('g')
        .attr('class', 'legend');

    legend.append('rect')
        .attr('x', -8)
        .attr('y', -8)
        .attr('width', 180)
        .attr('height', uniqueTypes.length * 14 + 16)
        .attr('fill', 'rgb(60, 60, 60)')
        .attr('opacity', 0.8)
        .attr('rx', 4);

    legend.append('text')
        .attr('x', 0)
        .attr('y', 4)
        .text('Facility Types')
        .style('font-weight', 'bold')
        .style('font-size', '12px')
        .style('fill', 'aliceblue');

    const legendItems = legend.selectAll('.legend-item')
        .data(uniqueTypes)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 14 + 14})`);

    legendItems.append('circle')
        .attr('cx', 8)
        .attr('cy', 0)
        .attr('r', 4)
        .attr('fill', d => facilityTypes[d]?.color || '#999');

    legendItems.append('text')
        .attr('x', 16)
        .attr('y', 3)
        .text(d => d)
        .style('font-size', '12px')
        .style('fill', 'aliceblue');
}

function getFacilityCategory(type) {
    if (!facilityTypes[type]) {
        console.warn(`Facility type not found in mapping: "${type}"`);
        return 'other';
    }
    return facilityTypes[type].category || 'other';



}

function initScroller() {
    scroller
        .setup({
            step: '.step',
            offset: 0.8,
            debug: false
        })
        .onStepEnter(response => {
            response.element.classList.add('is-active');
            updateMap(response.element.dataset.step);
        })
        .onStepExit(response => {
            response.element.classList.remove('is-active');
        });
}

function updateMap(step) {
    const baseRadius = window.innerWidth < 768 ? 3 : 5;
    map.selectAll('.facility')
        .transition()
        .duration(500)
        .attr('opacity', 0.2)
        .attr('r', d => (facilityTypes[d.type]?.radius || 5) * 0.8 / (window.innerWidth < 768 ? 1.5 : 1));

    if (step === 'all') {
        map.selectAll('.facility')
            .transition()
            .duration(500)
            .attr('opacity', 0.8)
            .attr('r', d => (facilityTypes[d.type]?.radius || 5) / (window.innerWidth < 768 ? 1.5 : 1));
    } else {
        map.selectAll(`.facility.${step}`)
            .transition()
            .duration(500)
            .attr('opacity', 1)
            .attr('r', d => (facilityTypes[d.type]?.radius || 5) * 1.3 / (window.innerWidth < 768 ? 1.5 : 1));
    }
}