// data sources
// usCounties = topojson
const usCounties =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const eduData =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

// 9 colors for fill
const colors = [
  "rgb(255,247,251)",
  "rgb(236,226,240)",
  "rgb(208,209,230)",
  "rgb(166,189,219)",
  "rgb(103,169,207)",
  "rgb(54,144,192)",
  "rgb(2,129,138)",
  "rgb(1,108,89)",
  "rgb(1,70,54)",
];

// define div for tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

const mapContainer = d3.select(".map-container");

// div for legend
mapContainer.append("div").attr("id", "legend");

// define legend canvas size
const lheight = 60;
const lwidth = 400;
const lpadding = 14;

// inject legend
const svgLegend = d3
  .select("#legend")
  .append("svg")
  .attr("height", lheight)
  .attr("width", lwidth);

// define map canvas size
const width = 1200;
const height = 600;
const padding = 65;

// inject map
const svg = mapContainer
  .append("svg")
  .attr("height", height)
  .attr("width", width);

// define projection
const projection = d3
  .geoAlbersUsa()
  .scale(1000)
  .translate(width / 2, height / 2);

// define path
const path = d3.geoPath().projection(projection);

// fetch data
Promise.all([d3.json(usCounties), d3.json(eduData)]).then(makeMap);

function makeMap(data, error) {
  if (error) console.error();

  [counties, education] = data;

  // console.log(d3.extent(education, (d) => d.bachelorsOrHigher));

  const minBachelorsOrHigher = d3.min(education, (d) => d.bachelorsOrHigher);
  const maxBachelorsOrHigher = d3.max(education, (d) => d.bachelorsOrHigher);

  // define color scale
  const colorScale = d3
    .scaleThreshold()
    .domain(
      d3.range(
        minBachelorsOrHigher,
        maxBachelorsOrHigher,
        (maxBachelorsOrHigher - minBachelorsOrHigher) / colors.length
      )
    )
    .range(colors);

  // define legend x scale and axis
  const lxScale = d3
    .scaleLinear()
    .domain(d3.extent(education, (d) => d.bachelorsOrHigher))
    .range([lpadding, lwidth - lpadding]);

  const lxAxis = d3.axisBottom(lxScale);

  // inject legend rectangles
  const lRectWidth = (lwidth - 2 * lpadding) / colors.length;

  svgLegend
    .selectAll("rect")
    .data(colors)
    .enter()
    .append("rect")
    .attr("y", lpadding)
    .attr("x", function (d, i) {
      return lpadding + i * lRectWidth;
    })
    .attr("height", lpadding)
    .attr("width", lRectWidth)
    .style("fill", function (d) {
      return d;
    });

  // inject legend x axis
  const tickRange = d3.range(
    minBachelorsOrHigher,
    maxBachelorsOrHigher +
      (maxBachelorsOrHigher - minBachelorsOrHigher) / colors.length,
    (maxBachelorsOrHigher - minBachelorsOrHigher) / colors.length
  );

  svgLegend
    .append("g")
    .attr("id", "lxAxis")
    .attr("transform", "translate(0, " + lpadding + ")")
    .call(
      lxAxis
        .tickSize(lpadding)
        .tickFormat(function (x) {
          return d3.format(".1f")(x) + "%";
        })
        .tickValues(tickRange)
    )
    .select(".domain") // remove horizontal axis fill
    .remove();
}
