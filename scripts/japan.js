(function () {
  const margin = {
    top: 50,
    right: 30,
    bottom: 60,
    left: 70,
  };
  const width = 750 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3
    .select("#chart-survivor")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .attr("style", "font: 10px sans-serif");
  //read data
  d3.csv("data/survivor_data.csv")
    .then((data) => {
      data.forEach((d) => {
        d.year = +d.year;
        d.survivors = parseFloat(d.survivors.replace(/,/g, ""));
      });
      console.log(data);
      //scales
      const xScale = d3.scaleLinear().domain([1945, 2030]).range([0, width]);
      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.survivors)])
        .range([height, 0]);

      svg.append("g").call(d3.axisLeft(yScale));
      //x-axis label
      svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(
          d3
            .axisBottom(xScale)
            .tickFormat(d3.format("d"))
            .ticks((2030 - 1945) / 5)
        )
        .selectAll("text")
        .attr("text-anchor", "middle");
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text("Year")
        .attr("font-size", "12px")
        .attr("fill", "#333");
      //y-axis label
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("x", -margin.left + 20)
        .attr("y", margin.top - 70)
        .attr("text-anchor", "start")
        .text("Number of Survivors")
        .attr("font-size", "12px");
      //create line for chart
      const line = d3
        .line()
        .x((d) => xScale(d.year))
        .y((d) => yScale(d.survivors));
      svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("d", line);
      svg
        .selectAll(".data-point")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "data-point")
        .attr("cx", (d) => xScale(d.year))
        .attr("cy", (d) => yScale(d.survivors))
        // .attr("r", 2)
        .attr("fill", "blue")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

      //gridlines
      const verticalGrid = svg
        .append("line")
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "4 2")
        .attr("stroke-width", 1)
        .attr("y1", 0)
        .attr("y2", height)
        .attr("visibility", "hidden");

      const horizontalGrid = svg
        .append("line")
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "4 2")
        .attr("stroke-width", 1)
        .attr("x1", 0)
        .attr("x2", width)
        .attr("visibility", "hidden");
      //area for mouse to hover
      svg
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mousemove", function (event) {
          const [mx, my] = d3.pointer(event);
          const x0 = xScale.invert(mx);

          const bisect = d3.bisector((d) => d.year).left;
          const i = bisect(data, x0);
          const d0 = data[i - 1];
          const d1 = data[i];
          const d = !d0 || (d1 && x0 - d0.x > d1.x - x0) ? d1 : d0;

          const dx = xScale(d.year);
          const dy = yScale(d.survivors);
          const distance = Math.abs(mx - dx);

          if (distance < 10) {
            verticalGrid
              .attr("x1", dx)
              .attr("x2", dx)
              .attr("y1", dy - 10)
              .attr("y2", height)
              .attr("visibility", "visible");

            horizontalGrid
              .attr("y1", dy)
              .attr("y2", dy)
              .attr("x1", 0)
              .attr("x2", dx + 10)
              .attr("visibility", "visible");
          } else {
            verticalGrid.attr("visibility", "hidden");
            horizontalGrid.attr("visibility", "hidden");
          }
        })
        .on("mouseout", () => {
          verticalGrid.attr("visibility", "hidden");
          horizontalGrid.attr("visibility", "hidden");
        });

      // svg
      //   .selectAll(".verticle-hover-area")
      //   .data(data)
      //   .enter()
      //   .append("rect")
      //   .attr("x", (d) => xScale(d.year) - 10)
      //   .attr("y", 0)
      //   .attr("width", 20)
      //   .attr("height", height)
      //   .attr("fill", "none")
      //   .attr("pointer-events", "all")
      //   .on("mouseover", (event, d) => {
      // svg
      //   .append("text")
      //   .attr("id", "tooltip")
      //   .attr("x", xScale(d.year) + 10)
      //   .attr("y", yScale(d.survivors) - 10)
      //   // .text(`${d.year}: ${d.survivors} survivors`)
      //   // .attr("font-size", "12px")
      //   // .attr("fill", "#333");
      //   })
      //   .on("mouseout", () => {
      //     d3.select("#tooltip").remove();
      //   });

      // const manualPoints = [
      //   {
      //     year: 1945,
      //     description:
      //       "In August, the first atomic bombs are dropped on the cities of Hiroshima and Nagasaki. By the end of the year, more than 213,000 people have died.",
      //     x: xScale(1945),
      //     y: height - 50,
      //   },
      //   {
      //     year: 2025,
      //     description:
      //       "The city of Hiroshima prepares a project that allows people to ask questions of survivors, using AI to pull out the best answers form their pre-recorded testimony.",
      //     x: xScale(2025),
      //     y: height - 100,
      //   },
      // ];
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("style", "font: 13px sans-serif");

      //ommitted 1945 and 2025
      const highlightYears = [1957, 1980, 2023];
      const yearDescriptions = {
        1957: "Japan's Atomic Bomb Survivors Support Act becomes law.",
        1980: "The number of survivors peaks at 372,264.",
        2023: "The number of survivors has dwindled to 106,825. The survivors' average age is 85.",
      };

      svg
        .selectAll(".tooltip-circle")
        .data(data.filter((d) => highlightYears.includes(d.year)))
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.year))
        .attr("cy", (d) => yScale(d.survivors))
        .attr("r", 4)
        .attr("fill", "red")
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .attr("class", "tooltip-circle")
        .on("mouseover", (event, d) => {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`)
            .style("display", "block")
            .html(
              `<strong>${d.year}</strong>: ${
                yearDescriptions[d.year] || `${d.survivors} survivors`
              }`
            );
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
        });
      // svg
      //   .selectAll(".manual-over-area")
      //   .data(manualPoints)
      //   .enter()
      //   .append("rect")
      //   .attr("x", (d) => d.x - 10)
      //   .attr("y", 0)
      //   .attr("width", 20)
      //   .attr("height", height)
      //   .attr("fill", "none")
      //   .attr("pointer-events", "all")
      //   .on("mouseover", (event, d) => {
      //     tooltip
      //       .style("left", `${event.pageX + 10}px`)
      //       .style("top", `${event.pageY - 20}px`)
      //       .style("display", "block")
      //       .html(`<strong>${d.year}</strong>: ${d.description}`);
      //   })
      //   .on("mouseout", () => {
      //     tooltip.style("display", "none");
      //   });
      // svg.selectAll(".highlight-circle")
      //   .data(data.filter((d) => highlightYears.includes(d.year)))
      //   .enter()
      //   .append("circle")

      // svg
      //   .selectAll(".manualCircles")
      //   .data(manualPoints)
      //   .append(circle)
      //   .attr("cx", (d) => xScale(d.year))
      //   .attr("cy", (d) => yScale(d.survivors))
      //   .attr("r", 2)
      //   .attr("fill", "blue")
      //   .attr("stroke", "black")
      //   .attr("stroke-width", 1);
    })
    .catch((error) => {
      console.error("Error loading the CSV file", error);
    });
})();
