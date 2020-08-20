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

// canvas size
const width = 1200;
const height = 600;
const padding = 65;

// inject svg canvas
const svg = d3
  .select(".map-container")
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

function makeMap(error, counties, education) {}
