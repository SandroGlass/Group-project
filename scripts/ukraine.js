(function () {
  // Type colors mapping
  const typeColors = {
    "Nuclear power plant": "#ff4d4d",
    "Strategic missile divisions": "#ff9900",
    "Major military-industrial enterprise": "#4d94ff",
    "Missile Army": "#cc00cc",
    "HQ Black Sea Fleet": "#0066cc",
    "Strategic aviation": "#33cc33",
    "Nuclear research institute": "#9966ff",
    "Nuclear warhead storage": "#ffcc00",
  };

  // Main map container
  const mapContainer = document.getElementById("map-container");
  let ukraineGeoData = null;
  let nuclearData = [];
  let hoveredPoint = null;
  let tooltip = null;

  // SVG dimensions
  const width = 800;
  const height = 500;

  // Create the SVG element
  const svg = d3
    .select(mapContainer)
    .append("svg")
    .style("width", "90%")
    .style("max-width", "800px")
    .style("height", "600")
    .attr("viewBox", "0 0 800 600");

  // Initialize tooltip
  function createTooltip() {
    tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.style.display = "none";
    tooltip.style.position = "absolute";
    tooltip.style.zIndex = "1000";
    tooltip.style.borderRadius = "0"; // No rounded edges
    tooltip.style.padding = "10px";
    tooltip.style.maxWidth = "300px";
    tooltip.style.backgroundColor = "#333"; // Dark background
    tooltip.style.color = "#fff"; // White text
    tooltip.style.fontSize = "14px";
    tooltip.style.lineHeight = "1.4";
    tooltip.style.border = "none"; // No borders
    mapContainer.appendChild(tooltip);
  }

  // Show tooltip function - MODIFIED to prevent cutoff at edges
  function showTooltip(point, x, y) {
    // Use custom description if available, otherwise show type
    const description = point.description || point.type;

    // Create tooltip content with styled elements
    tooltip.innerHTML = `
      <div style="font-weight: bold; font-size: 16px; margin-bottom: 6px;">
        ${point.address}
      </div>
      <div style="margin: 0;">
        ${description}
      </div>
    `;

    // Make the tooltip visible
    tooltip.style.display = "block";

    // Get tooltip dimensions after making it visible
    const tooltipRect = tooltip.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;

    // Calculate initial position relative to point
    let left = x + 15;
    let top = y - tooltipHeight - 15;

    // Adjust position if necessary to prevent clipping
    // Check right edge
    if (left + tooltipWidth > mapContainer.clientWidth) {
      left = x - tooltipWidth - 15;
    }

    // Check top edge
    if (top < 0) {
      top = y + 25;
    }

    // Check bottom edge
    if (top + tooltipHeight > mapContainer.clientHeight) {
      top = mapContainer.clientHeight - tooltipHeight - 10;
    }

    // Position the tooltip
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  // Helper function not needed anymore since we're not adjusting colors

  // Hide tooltip function
  function hideTooltip() {
    tooltip.style.display = "none";
  }

  // Create the legend
  function createLegend() {
    const legend = document.createElement("div");
    legend.className = "legend";

    let legendHTML = "<h3>Facility Types</h3>";

    for (const type in typeColors) {
      legendHTML += `
              <div class="legend-item">
                  <div class="legend-color" style="background-color: ${typeColors[type]};"></div>
                  <span>${type}</span>
              </div>
          `;
    }

    legend.innerHTML = legendHTML;
    mapContainer.appendChild(legend);
  }

  // Ukraine GeoJSON data - hardcoded to avoid CORS issues
  const ukraineGeoJsonData = {
    type: "Feature",
    properties: {
      name: "Ukraine",
      code: "UKR",
      group: "Countries",
    },
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [31.785998, 52.101678],
          [32.159412, 52.061267],
          [32.412058, 52.288695],
          [32.715761, 52.238465],
          [33.7527, 52.335075],
          [34.391731, 51.768882],
          [34.141978, 51.566413],
          [34.224816, 51.255993],
          [35.022183, 51.207572],
          [35.377924, 50.773955],
          [35.356116, 50.577197],
          [36.626168, 50.225591],
          [37.39346, 50.383953],
          [38.010631, 49.915662],
          [38.594988, 49.926462],
          [40.069058, 49.601055],
          [40.080789, 49.30743],
          [39.674664, 48.783818],
          [39.895632, 48.232405],
          [39.738278, 47.898937],
          [38.770585, 47.825608],
          [38.255112, 47.5464],
          [38.223538, 47.10219],
          [37.425137, 47.022221],
          [36.759855, 46.6987],
          [35.823685, 46.645964],
          [34.962342, 46.273197],
          [35.020788, 45.651219],
          [35.510009, 45.409993],
          [36.529998, 45.46999],
          [36.334713, 45.113216],
          [35.239999, 44.939996],
          [33.882511, 44.361479],
          [33.326421, 44.564877],
          [33.546924, 45.034771],
          [32.454174, 45.327466],
          [32.630804, 45.519186],
          [33.588162, 45.851569],
          [33.298567, 46.080598],
          [31.74414, 46.333348],
          [31.675307, 46.706245],
          [30.748749, 46.5831],
          [30.377609, 46.03241],
          [29.603289, 45.293308],
          [29.149725, 45.464925],
          [28.679779, 45.304031],
          [28.233554, 45.488283],
          [28.485269, 45.596907],
          [28.659987, 45.939987],
          [28.933717, 46.25883],
          [28.862972, 46.437889],
          [29.072107, 46.517678],
          [29.170654, 46.379262],
          [29.759972, 46.349988],
          [30.024659, 46.423937],
          [29.83821, 46.525326],
          [29.908852, 46.674361],
          [29.559674, 46.928583],
          [29.415135, 47.346645],
          [29.050868, 47.510227],
          [29.122698, 47.849095],
          [28.670891, 48.118149],
          [28.259547, 48.155562],
          [27.522537, 48.467119],
          [26.857824, 48.368211],
          [26.619337, 48.220726],
          [26.19745, 48.220881],
          [25.945941, 47.987149],
          [25.207743, 47.891056],
          [24.866317, 47.737526],
          [24.402056, 47.981878],
          [23.760958, 47.985598],
          [23.142236, 48.096341],
          [22.710531, 47.882194],
          [22.64082, 48.15024],
          [22.085608, 48.422264],
          [22.280842, 48.825392],
          [22.558138, 49.085738],
          [22.776419, 49.027395],
          [22.51845, 49.476774],
          [23.426508, 50.308506],
          [23.922757, 50.424881],
          [24.029986, 50.705407],
          [23.527071, 51.578454],
          [24.005078, 51.617444],
          [24.553106, 51.888461],
          [25.327788, 51.910656],
          [26.337959, 51.832289],
          [27.454066, 51.592303],
          [28.241615, 51.572227],
          [28.617613, 51.427714],
          [28.992835, 51.602044],
          [29.254938, 51.368234],
          [30.157364, 51.416138],
          [30.555117, 51.319503],
          [30.619454, 51.822806],
          [30.927549, 52.042353],
          [31.785998, 52.101678],
        ],
      ],
    },
  };

  // Nuclear facilities data - MODIFIED to include custom descriptions
  const nuclearFacilitiesData = [
    {
      address: "Rivne",
      lat: 51.32806,
      lon: 25.89505,
      type: "Nuclear power plant",
      description:
        "Its construction began in 1973. It started with two nuclear reactors in 1980-1981, and added two more by 2004. With 2,835 MW, it powers millions of homes yearly. Despite the Ukraine-Russia war, it operates safely with non-Russian fuel.",
    },
    {
      address: "Khmelnytskyi",
      lat: 49.41849,
      lon: 26.976,
      type: "Strategic missile divisions",
      description:
        "The Soviet 19th Missile Division once controlled 90 SS-19 Stiletto intercontinental ballistic missiles, each capable of carrying six nuclear warheads. After Ukraine's independence, these were dismantled or sent to Russia by 2005.",
    },
    {
      address: "Khmelnytskyi",
      lat: 50.30334,
      lon: 26.65247,
      type: "Nuclear power plant",
      description:
        "It generates electricity with two reactors running since 1987 and 2004. Two new reactors are being built with US technology. It stays safe despite nearby Russian attacks in 2023.",
    },
    {
      address: "Mykolaiv",
      lat: 46.97586,
      lon: 31.99397,
      type: "Major military-industrial enterprise",
      description:
        "Mykolaiv's Naval Shipyard once constructed vessels designed to carry nuclear weapons, including submarines and aircraft carriers, during the Soviet era. While it built platforms capable of nuclear weapons deployment, the facility itself never housed nuclear warheads or materials. After Ukraine's independence, it transitioned to conventional shipbuilding.",
    },
    {
      address: "Nadvirna",
      lat: 48.63359,
      lon: 24.5684,
      type: "Nuclear warhead storage",
      description:
        "Secure underground facility for tactical nuclear warheads storage",
    },
    {
      address: "Kyiv",
      lat: 50.41207,
      lon: 30.44389,
      type: "Major military-industrial enterprise",
      description:
        "The Antonov facility produced large transport aircraft that, while not designed as bombers, had the physical capacity to carry nuclear weapons as cargo during the Soviet era. After Ukraine's denuclearization, these aircraft served exclusively non-nuclear roles.",
    },
    {
      address: "Vinnytsia",
      lat: 49.23202,
      lon: 28.46798,
      type: "Missile Army",
      description:
        "Vinnytsia hosted the Soviet 43rd Missile Army's headquarters, controlling SS-11 Sego (single-warhead), SS-19 Stiletto (six-warhead), and SS-24 Scalpel (multi-warhead) nuclear missiles. These were dismantled by 2001 after Ukraine gave up nuclear weapons, and the site is now inactive.",
    },
    {
      address: "Makariv-1",
      lat: 50.4656,
      lon: 29.8142,
      type: "Strategic missile divisions",
      description:
        "The secret military town of Makariv-1 was established In 1969. It housed two military units (one responsible for nuclear weapons maintenance, the other for military seismology) and a concrete manufacturing plant. In 1996, all nuclear weapons were relocated to Russia.",
    },
    {
      address: "Chornobyl",
      lat: 51.27055,
      lon: 30.21956,
      type: "Nuclear power plant",
      description:
        "Chernobyl Nuclear Power Plant was the site of the 1986 nuclear disaster, the worst ever, fuelling anti-nuclear sentiment that helped push Ukraine to abandon nuclear weapons by 2001. Now shut down, its fourth reactor is encased in a steel shield, damaged by a Russian drone in 2025 with no radiation leak.",
    },
    {
      address: "Pervomaisk",
      lat: 47.6816,
      lon: 29.20928,
      type: "Strategic missile divisions",
      description:
        "In Pervomaisk, the Soviet 46th Missile Division controlled 40 SS-19 Stiletto missiles (up to six warheads each) and 46 SS-24 Scalpel missiles (multiple warheads). Ukraine dismantled them by 2001, and the division is now inactive.",
    },
    {
      address: "Zaporizhzhia",
      lat: 47.82476,
      lon: 35.34002,
      type: "Nuclear power plant",
      description:
        "The Zaporizhzhia Nuclear Power Plant is Europe's largest nuclear facility, with six reactors built between 1985-1996. Designed solely for civilian power generation, it previously supplied about 20% of Ukraine's electricity. Since Russia's 2022 invasion, the plant has been occupied, raising serious international safety concerns.",
    },
    {
      address: "Sevastopol",
      lat: 44.55517,
      lon: 33.66208,
      type: "HQ Black Sea Fleet",
      description:
        "The Black Sea Fleet Headquarters commanded nuclear-capable ships and submarines during the Soviet era. While no nuclear weapons were stored at the headquarters itself, it coordinated vessels armed with tactical nuclear weapons. After Ukrainian independence, agreements prohibited nuclear weapons deployment in Ukrainian waters until Russia's 2014 annexation of Crimea.",
    },
    {
      address: "Sevastopol",
      lat: 44.62464,
      lon: 33.3356899,
      type: "Nuclear research institute",
      description:
        "The Naval Institute trained Soviet and later Ukrainian naval officers from 1937-2014, including those who would serve on nuclear-powered vessels and submarines carrying nuclear weapons. While not housing nuclear materials itself, it provided specialized education in nuclear propulsion and weapons deployment. Russia took control of the facility in 2014.",
    },
    {
      address: "Dnipropetrovsk",
      lat: 48.46802,
      lon: 35.04177,
      type: "Major military-industrial enterprise",
      description:
        "The Pivdenne Design Bureau (est. 1954) designed Soviet nuclear-capable missiles, including the powerful SS-18 'Satan' missile. While never producing nuclear warheads, it created the rockets that could deliver them. After independence, it shifted to civilian spacecraft development.",
    },
    {
      address: "Kharkiv",
      lat: 49.99232,
      lon: 36.23101,
      type: "Major military-industrial enterprise",
      description:
        "Established in 1959, Khartron was a specialized facility that created guidance computers and control systems for Soviet nuclear missiles. Though it never made nuclear warheads, its technology was crucial for directing missiles to their targets. After independence, it shifted to civilian technology.",
    },
    {
      address: "Kharkiv",
      lat: 50.09436,
      lon: 36.26277,
      type: "Nuclear research institute",
      description:
        "The Institute of Physics and Technology was a major Soviet nuclear research centre established in 1928. It housed experimental reactors and accelerators that once supported weapons research. After Ukraine's independence, it converted to peaceful nuclear science under international monitoring.",
    },
    {
      address: "Pryluky",
      lat: 50.61212,
      lon: 32.3873,
      type: "Strategic aviation",
      description:
        "Home base for the 184th Bomber Regiment which operated 19 Tu-160 supersonic strategic bombers, the Soviet Union's most advanced nuclear delivery platform. 8 were transferred to Russia by 2000, with the remainder dismantled under international supervision. The base is now inactive.",
    },
    {
      address: "Kyiv",
      lat: 50.39839,
      lon: 30.56728,
      type: "Nuclear research institute",
      description:
        "The Institute for Nuclear Research houses Ukraine's only operational research nuclear reactor (WWR-M, 10MW), established in 1970. The institute conducts peaceful nuclear research under IAEA safeguards. It also operates the U-240, a specialized machine that creates radioactive materials for medicine and science.",
    },
    {
      address: "Pivdennoukrainsk",
      lat: 47.81065,
      lon: 31.22062,
      type: "Nuclear power plant",
      description:
        "The South Ukraine Nuclear Power Plant operates three 1,000 MW reactors that came online between 1982-1989. Built solely for civilian power generation, it provides about 10% of Ukraine's electricity. The facility has always been separate from any military nuclear program and operates under international safety monitoring.",
    },
    {
      address: "Uzyn",
      lat: 49.82847,
      lon: 30.41972,
      type: "Strategic aviation",
      description:
        "Former base for the 106th Bomber Regiment which once operated 25 Tu-95MS strategic bombers, capable of carrying nuclear missiles. Ukraine transferred these to Russia by 2000, and the regiment was disbanded by 2006. ",
    },
    {
      address: "Tsybuleve",
      lat: 48.81752,
      lon: 32.47767,
      type: "Nuclear warhead storage",
      description:
        "This Soviet military nuclear waste site threatened local health until recently. In partnership with NATO, Ukraine removed radioactive materials from three concrete storage wells and transported them to the disposal facility in the Chernobyl Zone.",
    },
    {
      address: "Feodosiya",
      lat: 45.03312,
      lon: 35.31117,
      type: "Nuclear warhead storage",
      description:
        " Feodosiya-13 was a secret Soviet nuclear weapons storage site built inside a mountain between 1951-1955. The facility housed an assembly hall where nuclear bombs were maintained and stored. In 1996, all nuclear weapons were removed to Russia. The site later became a military base for Ukrainian forces until 2014, when Russia invaded.",
    },
    {
      address: "Zhovti Vody",
      lat: 48.34652,
      lon: 33.50278,
      type: "Major military-industrial enterprise",
      description:
        "The VostGOK facility has mined and processed uranium since 1951. During Soviet times, it produced uranium concentrate for both nuclear weapons and power plants. After Ukraine's independence, it supplied material only for civilian nuclear energy. The facility continues limited operations today under international monitoring.",
    },
    {
      address: "Dnipropetrovsk",
      lat: 48.43405,
      lon: 34.99987,
      type: "Major military-industrial enterprise",
      description:
        "The Pivdennyi Machine Building Plant (est. 1944) was the manufacturing facility that actually built the Soviet nuclear missiles. Unlike the nearby Design Bureau that created blueprints, this factory physically assembled the rockets. After Ukraine's independence, it transitioned to producing civilian spacecraft and satellite components.",
    },
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
      console.error("Error initializing map:", error);
    }
  }

  // Render the map with the data
  function renderMap() {
    // Create projection
    const projection = d3
      .geoMercator()
      .fitSize([width, height], ukraineGeoData);
    const path = d3.geoPath().projection(projection);

    // Draw Ukraine outline
    svg
      .append("path")
      .datum(ukraineGeoData)
      .attr("class", "ukraine-outline")
      .attr("d", path);

    // Draw nuclear facilities
    nuclearData.forEach((point, index) => {
      const [x, y] = projection([point.lon, point.lat]);

      svg
        .append("circle")
        .attr("class", "facility-point")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 8)
        .attr("fill", typeColors[point.type] || "#999")
        .attr("stroke", "#555")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.8)
        .on("mouseenter", function (event) {
          showTooltip(point, x, y);
          d3.select(this).attr("opacity", 1);
        })
        .on("mouseleave", function () {
          hideTooltip();
          d3.select(this).attr("opacity", 0.8);
        });
    });
  }

  // Initialize the map on page load
  document.addEventListener("DOMContentLoaded", initMap);

  // Handle window resize and cleanup on page unload
  window.addEventListener("resize", () => {
    // Clear existing content
    svg.selectAll("*").remove();

    // Remove old elements except the original SVG
    while (mapContainer.firstChild) {
      if (mapContainer.firstChild === svg.node()) {
        mapContainer.firstChild.innerHTML = "";
        break;
      }
      mapContainer.removeChild(mapContainer.firstChild);
    }

    // Readjust SVG dimensions
    svg
      .attr("width", mapContainer.clientWidth)
      .attr("height", mapContainer.clientHeight);

    // Redraw the map
    renderMap();
    createLegend();
    createTooltip();
  });

  // No need for tooltip cleanup on unload since it's attached to mapContainer
  // which will be cleaned up when the page unloads
})();
