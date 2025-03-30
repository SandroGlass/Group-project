const margin = {
  top: 50,
  right: 20,
  bottom: 50,
  left: 60,
};
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3
  .select("#chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("survivor_data.csv")
  .then((data) => {
    data.forEach((d) => {
      d.year = +d.year;
      d.survivors = parseFloat(d.survivors.replace(/,/g, ""));
    });
    console.log(data);

    const xScale = d3.scaleLinear().domain([1945, 2030]).range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.survivors)])
      .range([height, 0]);

    svg.append("g").call(d3.axisLeft(yScale));

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
      .attr("cx", (d) => xScale(d.year))
      .attr("cy", (d) => yScale(d.survivors))
      .attr("r", 2)
      .attr("fill", "blue")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    svg
      .selectAll(".verticle-hover-area")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.year) - 10)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseover", (event, d) => {
        svg
          .append("text")
          .attr("id", "tooltip")
          .attr("x", xScale(d.year) + 10)
          .attr("y", yScale(d.survivors) - 10)
          .text(`Year:${d.year}, Survivors:${d.survivors}`)
          .attr("font-size", "12px")
          .attr("fill", "#333");
      })
      .on("mouseout", () => {
        d3.select("#tooltip").remove();
      });
    const manualPoints = [
      {
        year: 1945,
        description:
          "The first atomic bomb was dropped on the cities of Hiroshima and Nagasaki. It is estimated that total of more than 213,000 people have died by the end of the year.",
        x: xScale(1945),
        y: height - 50,
      },
      {
        year: 2025,
        description:
          "80th Commemoration year. The Hiroshima municipality will set up survivors’ testimony response devices. It uses AI to analyse users’ questions and match them with prerecorded answers from survivors.",
        x: xScale(2025),
        y: height - 100,
      },
    ];
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    const highlightYears = [1945, 1957, 1980, 2023, 2025];
    const yearDescriptions = {
      1957: "The Atomic Bomb Survivors’ Support Act was enacted.",
      1980: "The number of survivors peaked at 372,264.",
      2023: "The number of survivors has dwindled to 106,825, with the average age being 85.58.",
    };
    svg
      .selectAll(".highlight-circle")
      .data(data.filter((d) => highlightYears.includes(d.year)))
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.year) - 10)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
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

    svg
      .selectAll(".manual-over-area")
      .data(manualPoints)
      .enter()
      .append("rect")
      .attr("x", (d) => d.x - 10)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseover", (event, d) => {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`)
          .style("display", "block")
          .html(`<strong>${d.year}</strong>: ${d.description}`);
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });
  })
  .catch((error) => {
    console.error("Error loading the CSV file", error);
  });
