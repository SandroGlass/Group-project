// // source for code: https://observablehq.com/@d3/multi-line-chart/2
// (function () {
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
//     updateChart();
//   });

//   const width = 928;
//   const height = 600;
//   const marginTop = 20;
//   const marginRight = 30;
//   const marginBottom = 30;
//   const marginLeft = 80;

//   function updateChart() {
//     if (stockpileData.length === 0) return;

//     // scales
//     const x = d3
//       .scaleLinear()
//       .domain(d3.extent(stockpileData, (d) => d.Year))
//       .range([marginLeft, width - marginRight]);

//     const y = d3
//       .scaleLinear()
//       .domain([
//         0,
//         d3.max(stockpileData, (d) => d3.max(Object.values(d).slice(1))),
//       ])
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

//     const colour = d3
//       .scaleOrdinal()
//       .domain(Object.keys(stockpileData[0]).slice(1))
//       .range(custom_colours);

//     const chartContainer = d3.select("#linechart");
//     // chartContainer.selectAll("svg").remove();

//     const svg = chartContainer
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

//     // Add the y axis.
//     var yAxisGroup = chartGroup
//       .append("g")
//       .attr("transform", `translate(${marginLeft},0)`)
//       .call(d3.axisLeft(y))
//       // .call((g) => g.select(".domain").remove())
//       .call((g) =>
//         g
//           .append("text")
//           .attr("x", -marginLeft)
//           .attr("y", 10)
//           .attr("fill", "black")
//           .attr("text-anchor", "start")
//           .text("↑ Number of Nuclear Weapons")
//       );

//     const countries = Object.keys(stockpileData[0]).slice(1);
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

//     // Draw the lines.
//     const line = d3
//       .line()
//       .x((d) => x(d.Year))
//       .y((d) => y(d.Stockpile))
//       .defined((d) => d.Stockpile != null);

//     const path = chartGroup
//       .append("g")
//       .attr("fill", "none")
//       .attr("stroke-width", 1.5)
//       .attr("stroke-linejoin", "round")
//       .attr("stroke-linecap", "round")
//       .selectAll("path")
//       .data(dataByCountry)
//       .join("path")
//       .attr("stroke", (d) => (d.name === "World" ? "black" : colour(d.name)))
//       .style("mix-blend-mode", "multiply")
//       .attr("d", (d) => line(d.values));

//     // interactive tip
//     const dot = svg.append("g").attr("display", "none");

//     dot.append("circle").attr("r", 2.5);

//     dot.append("text").attr("text-anchor", "middle").attr("y", -8);

//     svg
//       .on("pointerenter", pointerentered)
//       .on("pointermove", pointermoved)
//       .on("pointerleave", pointerleft)
//       .on("touchstart", (event) => event.preventDefault());

//     function pointermoved(event) {
//       const [xm, ym] = d3.pointer(event);
//       const closest = dataByCountry
//         .flatMap((d) => d.values.map((v) => ({ ...v, name: d.name })))
//         .reduce((a, b) =>
//           Math.hypot(x(b.Year) - xm, y(b.Stockpile) - ym) <
//           Math.hypot(x(a.Year) - xm, y(a.Stockpile) - ym)
//             ? b
//             : a
//         );

//       path
//         .style("stroke", (d) => (d.name === closest.name ? null : "#ddd"))
//         .filter((d) => d.name === closest.name)
//         .raise();
//       dot.attr(
//         "transform",
//         `translate(${x(closest.Year)},${y(closest.Stockpile)})`
//       );
//       // dot.select("text").text(closest.name);
//       dot
//         .select("text")
//         .text(`${closest.Year}: ${closest.name}, ${closest.Stockpile} weapons`);
//     }

//     function pointerentered() {
//       path.style("mix-blend-mode", null).style("stroke", "#ddd");
//       dot.attr("display", null);
//     }

//     function pointerleft() {
//       path.style("mix-blend-mode", "multiply").style("stroke", null);
//       dot.attr("display", "none");
//     }

//     //highlighted sentences

//     // legend
//     const legend = svg
//       .append("g")
//       .attr("transform", `translate(${width - 220 + 80}, 20)`);

//     countries.forEach((country, i) => {
//       const legendRow = legend
//         .append("g")
//         .attr("transform", `translate(0, ${i * 20})`)
//         .on("click", function () {
//           const clickedCountry = country;

//           const currentOpacity = d3
//             .selectAll("." + clickedCountry)
//             .style("opacity");
//           d3.selectAll("." + clickedCountry)
//             .transition()
//             .style("opacity", currentOpacity == 1 ? 0 : 1);
//         });

//       legendRow
//         .append("rect")
//         .attr("width", 15)
//         .attr("height", 15)
//         .attr("fill", country === "World" ? "black" : colour(country))
//         .style("cursor", "pointer");

//       legendRow
//         .append("text")
//         .attr("x", 20)
//         .attr("y", 8)
//         .attr("dy", "0.32em")
//         .text(country)
//         .attr("font-size", 11)
//         .style("cursor", "pointer");
//     });
//   }
// })();

// NEW CODE
(async function () {
  const margin = { top: 20, right: 30, bottom: 30, left: 80 };
  const width = 928;
  const height = 600;

  let visibleCountries = {};
  let data = await d3.csv("final_stockpile_line.csv", d3.autoType);

  // Clean and prepare data
  data.forEach((d) => {
    for (let key in d) {
      if (key !== "Year" && isNaN(d[key])) d[key] = null;
    }
  });

  const countries = Object.keys(data[0]).filter((k) => k !== "Year");
  countries.forEach((country) => (visibleCountries[country] = true));

  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.Year))
    .range([margin.left, width - margin.right]);

  let y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

  const color = d3
    .scaleOrdinal()
    .domain(countries)
    .range([
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
    ]);

  const svg = d3
    .select("#linechart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const xAxis = (g) =>
    g.attr("transform", `translate(0,${height - margin.bottom})`).call(
      d3
        .axisBottom(x)
        .ticks(width / 80)
        .tickFormat(d3.format("d"))
    );

  let yAxisG = svg.append("g").attr("transform", `translate(${margin.left},0)`);

  const lineGen = d3
    .line()
    .x((d) => x(d.Year))
    .y((d) => y(d.Stockpile))
    .defined((d) => d.Stockpile != null);

  const tooltip = svg.append("g").style("display", "none");
  tooltip.append("circle").attr("r", 3);
  tooltip.append("text").attr("y", -10).style("font", "10px sans-serif");

  function updateChart() {
    // Filter visible countries
    const maxY =
      d3.max(data, (row) =>
        d3.max(
          countries.filter((c) => visibleCountries[c]),
          (c) => row[c] || 0
        )
      ) || 100;

    y.domain([0, maxY]).nice();
    yAxisG.transition().duration(500).call(d3.axisLeft(y));

    const lines = svg.selectAll(".line").data(countries, (d) => d);

    lines.join(
      (enter) =>
        enter
          .append("path")
          .attr("class", "line")
          .attr("stroke", (d) => (d === "World" ? "black" : color(d)))
          .attr("fill", "none")
          .attr("stroke-width", 1.5)
          .attr("opacity", (d) => (visibleCountries[d] ? 1 : 0))
          .attr("d", (d) =>
            lineGen(data.map((row) => ({ Year: row.Year, Stockpile: row[d] })))
          ),
      (update) =>
        update
          .transition()
          .duration(500)
          .attr("opacity", (d) => (visibleCountries[d] ? 1 : 0))
          .attr("d", (d) =>
            lineGen(data.map((row) => ({ Year: row.Year, Stockpile: row[d] })))
          )
    );
  }

  function createLegend() {
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 200}, 20)`);

    countries.forEach((country, i) => {
      const row = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`)
        .style("cursor", "pointer")
        .style("opacity", visibleCountries[country] ? 1 : 0.5)
        .on("click", () => {
          visibleCountries[country] = !visibleCountries[country];
          row.style("opacity", visibleCountries[country] ? 1 : 0.5);
          updateChart();
        });

      row
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", country === "World" ? "black" : color(country));

      row
        .append("text")
        .attr("x", 20)
        .attr("y", 8)
        .attr("dy", "0.32em")
        .text(country);
    });
  }

  function setupInteraction() {
    svg.on("pointermove", (event) => {
      const [xm, ym] = d3.pointer(event);
      const visibleData = countries
        .filter((c) => visibleCountries[c])
        .flatMap((c) =>
          data.map((d) => ({
            Year: d.Year,
            Stockpile: d[c],
            name: c,
          }))
        )
        .filter((d) => d.Stockpile != null);

      if (!visibleData.length) {
        tooltip.style("display", "none");
        return;
      }

      const closest = d3.least(visibleData, (d) =>
        Math.hypot(x(d.Year) - xm, y(d.Stockpile) - ym)
      );

      tooltip.attr(
        "transform",
        `translate(${x(closest.Year)},${y(closest.Stockpile)})`
      );
      tooltip.select("text").text(`${closest.name}: ${closest.Stockpile}`);
      tooltip.style("display", null);
    });

    svg.on("pointerleave", () => {
      tooltip.style("display", "none");
    });
  }

  svg.append("g").call(xAxis);
  createLegend();
  setupInteraction();
  updateChart();
})();
