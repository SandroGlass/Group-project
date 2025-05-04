// source for code: https://observablehq.com/@d3/multi-line-chart/2
(function () {
  d3.csv("final_stockpile_line.csv", d3.autoType).then((data) => {
    data.forEach((d) => {
      d.Year = +d.Year;

      //for null values in csv
      Object.keys(d).forEach((key) => {
        if (key !== "Year" && isNaN(d[key])) {
          d[key] = null;
        }
      });
    });

    stockpileData = data;
    updateChart();
  });

  const width = 928;
  const height = 600;
  const marginTop = 20;
  const marginRight = 30;
  const marginBottom = 30;
  const marginLeft = 80;

  function updateChart() {
    if (stockpileData.length === 0) return;

    // scales
    const x = d3
      .scaleLinear()
      .domain(d3.extent(stockpileData, (d) => d.Year))
      .range([marginLeft, width - marginRight]);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(stockpileData, (d) => d3.max(Object.values(d).slice(1))),
      ])
      .range([height - marginBottom, marginTop]);

    // colours from flourish, L2R on csv
    const custom_colours = [
      "#FFD700",
      "#9B30FF",
      "#FF69B4",
      "#FF00FF",
      "#00FFFF",
      "#32CD32",
      "#007FFF",
      "#FF7F00",
      "#00CED1",
      "#FF3030",
    ];

    const colour = d3
      .scaleOrdinal()
      .domain(Object.keys(stockpileData[0]).slice(1))
      .range(custom_colours);

    const chartContainer = d3.select("#linechart");
    // chartContainer.selectAll("svg").remove();

    const svg = chartContainer
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr(
        "style",
        "width: 900px; height: auto; overflow: visible; font: 12px sans-serif; border: 1px solid #ccc; padding: 10px;"
      );

    const chartGroup = svg.append("g");

    // Add the x axis.
    var xAxisGroup = chartGroup
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0)
          .tickFormat(d3.format("d"))
      );

    // Add the y axis.
    var yAxisGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
      // .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "black")
          .attr("text-anchor", "start")
          .text("↑ Number of Nuclear Weapons")
      );

    const countries = Object.keys(stockpileData[0]).slice(1);
    //grouping stockpiles by country
    const dataByCountry = countries.map((country) => {
      return {
        name: country,
        values: stockpileData.map((d) => ({
          Year: d.Year,
          Stockpile: d[country],
        })),
      };
    });

    // Draw the lines.
    const line = d3
      .line()
      .x((d) => x(d.Year))
      .y((d) => y(d.Stockpile))
      .defined((d) => d.Stockpile != null);

    const path = chartGroup
      .append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .selectAll("path")
      .data(dataByCountry)
      .join("path")
      .attr("stroke", (d) => (d.name === "World" ? "black" : colour(d.name)))
      .style("mix-blend-mode", "multiply")
      .attr("d", (d) => line(d.values));

    // interactive tip
    const dot = svg.append("g").attr("display", "none");

    dot.append("circle").attr("r", 2.5);

    dot.append("text").attr("text-anchor", "middle").attr("y", -8);

    svg
      .on("pointerenter", pointerentered)
      .on("pointermove", pointermoved)
      .on("pointerleave", pointerleft)
      .on("touchstart", (event) => event.preventDefault());

    function pointermoved(event) {
      const [xm, ym] = d3.pointer(event);
      const closest = dataByCountry
        .flatMap((d) => d.values.map((v) => ({ ...v, name: d.name })))
        .reduce((a, b) =>
          Math.hypot(x(b.Year) - xm, y(b.Stockpile) - ym) <
          Math.hypot(x(a.Year) - xm, y(a.Stockpile) - ym)
            ? b
            : a
        );

      path
        .style("stroke", (d) => (d.name === closest.name ? null : "#ddd"))
        .filter((d) => d.name === closest.name)
        .raise();
      dot.attr(
        "transform",
        `translate(${x(closest.Year)},${y(closest.Stockpile)})`
      );
      // dot.select("text").text(closest.name);
      dot
        .select("text")
        .text(`${closest.Year}: ${closest.name}, ${closest.Stockpile} weapons`);
    }

    function pointerentered() {
      path.style("mix-blend-mode", null).style("stroke", "#ddd");
      dot.attr("display", null);
    }

    function pointerleft() {
      path.style("mix-blend-mode", "multiply").style("stroke", null);
      dot.attr("display", "none");
    }

    //highlighted sentences

    // legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 220 + 80}, 20)`);

    countries.forEach((country, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`)
        .on("click", function () {
          const clickedCountry = country;

          const currentOpacity = d3
            .selectAll("." + clickedCountry)
            .style("opacity");
          d3.selectAll("." + clickedCountry)
            .transition()
            .style("opacity", currentOpacity == 1 ? 0 : 1);
        });

      legendRow
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", country === "World" ? "black" : colour(country))
        .style("cursor", "pointer");

      legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 8)
        .attr("dy", "0.32em")
        .text(country)
        .attr("font-size", 11)
        .style("cursor", "pointer");
    });
  }
})();

// Below is code from Claude THAT DOESNT MAKE ANY SENSE TO ME !!1!!!1
// Keeping it here for emergency

// (function () {
//   // Store visibility state globally so it persists
//   let visibleCountries = {};
//   let stockpileData = [];

//   d3.csv("final_stockpile_line.csv", d3.autoType).then((data) => {
//     data.forEach((d) => {
//       d.Year = +d.Year;

//       //for null values in csv
//       Object.keys(d).forEach((key) => {
//         if (key !== "Year" && isNaN(d[key])) {
//           d[key] = null;
//         }
//       });
//     });

//     stockpileData = data;

//     // Initialize visibility state
//     const countries = Object.keys(stockpileData[0]).slice(1);
//     countries.forEach((country) => {
//       visibleCountries[country] = true; // All countries visible by default
//     });

//     // First render
//     createChart();
//   });

//   const width = 928;
//   const height = 600;
//   const marginTop = 20;
//   const marginRight = 30;
//   const marginBottom = 30;
//   const marginLeft = 80;

//   // Store chart elements that need to be updated
//   let svg, path, yAxis, dot, line, y;

//   // Duration for transitions
//   const transitionDuration = 600;

//   // Initial chart creation
//   function createChart() {
//     if (stockpileData.length === 0) return;

//     // Clear previous chart if any
//     d3.select("#linechart").selectAll("svg").remove();

//     const countries = Object.keys(stockpileData[0]).slice(1);

//     // X scale - doesn't change when toggling countries
//     const x = d3
//       .scaleLinear()
//       .domain(d3.extent(stockpileData, (d) => d.Year))
//       .range([marginLeft, width - marginRight]);

//     // Calculate max value considering only visible countries
//     const maxValueForVisibleCountries = d3.max(stockpileData, (d) => {
//       let maxForRow = 0;
//       Object.keys(d).forEach((key) => {
//         if (key !== "Year" && visibleCountries[key] && d[key] !== null) {
//           maxForRow = Math.max(maxForRow, d[key]);
//         }
//       });
//       return maxForRow;
//     });

//     // If no countries are visible or all values are null, use a default range
//     const yDomainMax = maxValueForVisibleCountries || 100;

//     // Y scale - this will be updated when toggling countries
//     y = d3
//       .scaleLinear()
//       .domain([0, yDomainMax])
//       .nice() // Rounds the domain to nice round numbers
//       .range([height - marginBottom, marginTop]);

//     // colours from flourish, L2R on csv
//     const custom_colours = [
//       "#FFD700",
//       "#9B30FF",
//       "#FF69B4",
//       "#FF00FF",
//       "#00FFFF",
//       "#32CD32",
//       "#007FFF",
//       "#FF7F00",
//       "#00CED1",
//       "#FF3030",
//     ];

//     const colour = d3.scaleOrdinal().domain(countries).range(custom_colours);

//     const chartContainer = d3.select("#linechart");

//     svg = chartContainer
//       .append("svg")
//       .attr("width", width)
//       .attr("height", height)
//       .attr("viewBox", [0, 0, width, height])
//       .attr(
//         "style",
//         "width: 900px; height: auto; overflow: visible; font: 12px sans-serif; border: 1px solid #ccc; padding: 10px;"
//       );

//     const chartGroup = svg.append("g");

//     // Add the x axis.
//     var xAxisGroup = chartGroup
//       .append("g")
//       .attr("transform", `translate(0,${height - marginBottom})`)
//       .call(
//         d3
//           .axisBottom(x)
//           .ticks(width / 80)
//           .tickSizeOuter(0)
//           .tickFormat(d3.format("d"))
//       );

//     // Add the y axis - store reference for updates
//     yAxis = chartGroup
//       .append("g")
//       .attr("transform", `translate(${marginLeft},0)`)
//       .call(d3.axisLeft(y))
//       .call((g) =>
//         g
//           .append("text")
//           .attr("x", -marginLeft)
//           .attr("y", 10)
//           .attr("fill", "black")
//           .attr("text-anchor", "start")
//           .text("↑ Number of Nuclear Weapons")
//       );

//     //grouping stockpiles by country
//     const dataByCountry = countries.map((country) => {
//       return {
//         name: country,
//         values: stockpileData.map((d) => ({
//           Year: d.Year,
//           Stockpile: d[country],
//         })),
//       };
//     });

//     // Create line generator - store reference for updates
//     line = d3
//       .line()
//       .x((d) => x(d.Year))
//       .y((d) => y(d.Stockpile))
//       .defined((d) => d.Stockpile != null);

//     // Draw the lines - store reference for updates
//     path = chartGroup
//       .append("g")
//       .attr("fill", "none")
//       .attr("stroke-width", 1.5)
//       .attr("stroke-linejoin", "round")
//       .attr("stroke-linecap", "round")
//       .selectAll("path")
//       .data(dataByCountry)
//       .join("path")
//       .attr("class", (d) => `line-${d.name.replace(/\s+/g, "-")}`) // Create CSS safe class names
//       .attr("stroke", (d) => (d.name === "World" ? "black" : colour(d.name)))
//       .style("mix-blend-mode", "multiply")
//       .style("opacity", (d) => (visibleCountries[d.name] ? 1 : 0)) // Set initial visibility
//       .attr("d", (d) => line(d.values));

//     // interactive tip
//     dot = svg.append("g").attr("display", "none");

//     dot.append("circle").attr("r", 2.5);

//     dot
//       .append("text")
//       .attr("text-anchor", "middle")
//       .attr("y", -8)
//       .style("font-size", "10px")
//       .style("font-weight", "bold");

//     svg
//       .on("pointerenter", pointerentered)
//       .on("pointermove", pointermoved)
//       .on("pointerleave", pointerleft)
//       .on("touchstart", (event) => event.preventDefault());

//     function pointermoved(event) {
//       const [xm, ym] = d3.pointer(event);

//       // Only consider visible countries for tooltip
//       const visibleData = dataByCountry
//         .filter((d) => visibleCountries[d.name])
//         .flatMap((d) => d.values.map((v) => ({ ...v, name: d.name })))
//         .filter((d) => d.Stockpile != null); // Filter out null values

//       // If no visible data, hide the tooltip
//       if (visibleData.length === 0) {
//         dot.attr("display", "none");
//         return;
//       }

//       const closest = visibleData.reduce((a, b) =>
//         Math.hypot(x(b.Year) - xm, y(b.Stockpile) - ym) <
//         Math.hypot(x(a.Year) - xm, y(a.Stockpile) - ym)
//           ? b
//           : a
//       );

//       // Only change stroke color for visible lines
//       path
//         .style("stroke", (d) => {
//           if (!visibleCountries[d.name]) return "none";
//           return d.name === closest.name ? null : "#ddd";
//         })
//         .filter((d) => d.name === closest.name && visibleCountries[d.name])
//         .raise();

//       dot.attr(
//         "transform",
//         `translate(${x(closest.Year)},${y(closest.Stockpile)})`
//       );

//       dot
//         .select("text")
//         .text(`${closest.Year}: ${closest.name}, ${closest.Stockpile} weapons`);

//       // Make sure dot is displayed
//       dot.attr("display", null);
//     }

//     function pointerentered() {
//       // Only show tooltip if there are visible lines
//       if (Object.values(visibleCountries).some((v) => v)) {
//         path
//           .style("mix-blend-mode", null)
//           .style("stroke", (d) => (visibleCountries[d.name] ? "#ddd" : "none"));
//         dot.attr("display", null);
//       }
//     }

//     function pointerleft() {
//       path.style("mix-blend-mode", "multiply").style("stroke", (d) => {
//         if (!visibleCountries[d.name]) return "none";
//         return d.name === "World" ? "black" : colour(d.name);
//       });
//       dot.attr("display", "none");
//     }

//     // legend
//     const legend = svg
//       .append("g")
//       .attr("transform", `translate(${width - 220 + 80}, 20)`);

//     // Create legend items with toggle functionality
//     countries.forEach((country, i) => {
//       const legendRow = legend
//         .append("g")
//         .attr("transform", `translate(0, ${i * 20})`)
//         .attr("class", "legend-item")
//         .style("cursor", "pointer")
//         .style("opacity", visibleCountries[country] ? 1 : 0.5) // Set initial state
//         .on("click", function () {
//           // Toggle visibility state
//           visibleCountries[country] = !visibleCountries[country];

//           // Update the appearance of the legend item
//           d3.select(this).style("opacity", visibleCountries[country] ? 1 : 0.5);

//           // Toggle the visibility of the corresponding line with animation
//           const safeClassName = country.replace(/\s+/g, "-");
//           d3.select(`.line-${safeClassName}`)
//             .transition()
//             .duration(transitionDuration / 2)
//             .style("opacity", visibleCountries[country] ? 1 : 0);

//           // Update the y-axis and lines with animations
//           updateYAxis();
//         });

//       legendRow
//         .append("rect")
//         .attr("width", 15)
//         .attr("height", 15)
//         .attr("fill", country === "World" ? "black" : colour(country));

//       legendRow
//         .append("text")
//         .attr("x", 20)
//         .attr("y", 8)
//         .attr("dy", "0.32em")
//         .text(country)
//         .attr("font-size", 11);
//     });
//   }

//   // Function to update the y-axis with animation
//   function updateYAxis() {
//     // Calculate new max value considering only visible countries
//     const maxValueForVisibleCountries = d3.max(stockpileData, (d) => {
//       let maxForRow = 0;
//       Object.keys(d).forEach((key) => {
//         if (key !== "Year" && visibleCountries[key] && d[key] !== null) {
//           maxForRow = Math.max(maxForRow, d[key]);
//         }
//       });
//       return maxForRow;
//     });

//     // If no countries are visible or all values are null, use a default range
//     const yDomainMax = maxValueForVisibleCountries || 100;

//     // Update the y scale with new domain
//     y.domain([0, yDomainMax]).nice();

//     // Animate the y-axis transition
//     yAxis.transition().duration(transitionDuration).call(d3.axisLeft(y));

//     // Get countries for data binding
//     const countries = Object.keys(stockpileData[0]).slice(1);

//     // Regroup data by country to ensure we're using the same data structure
//     const dataByCountry = countries.map((country) => {
//       return {
//         name: country,
//         values: stockpileData.map((d) => ({
//           Year: d.Year,
//           Stockpile: d[country],
//         })),
//       };
//     });

//     // Update the line positions with animation
//     path
//       .data(dataByCountry) // Rebind data to ensure correct matching
//       .transition()
//       .duration(transitionDuration)
//       .attr("d", (d) => line(d.values));

//     // Reset tooltip to avoid showing info for hidden lines
//     dot.attr("display", "none");
//   }
// })();
