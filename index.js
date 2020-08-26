// data sources
// usUrl = topojson
const usUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
const eduDataUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

// 9 colors for fill

const colors = [
  "rgb(255,247,243)",
  "rgb(253,224,221)",
  "rgb(252,197,192)",
  "rgb(250,159,181)",
  "rgb(247,104,161)",
  "rgb(221,52,151)",
  "rgb(174,1,126)",
  "rgb(122,1,119)",
  "rgb(73,0,106)",
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
const width = 1000;
const height = 600;
const padding = 65;

// inject map
const svgMap = mapContainer
  .append("svg")
  .attr("height", height)
  .attr("width", width);

// define path
const path = d3.geoPath();

// fetch data
Promise.all([d3.json(usUrl), d3.json(eduDataUrl)]).then(makeMap);

function makeMap(data, error) {
  if (error) console.error();

  [usData, education] = data;

  const minBachelorsOrHigher = d3.min(education, (d) => d.bachelorsOrHigher);
  const maxBachelorsOrHigher = d3.max(education, (d) => d.bachelorsOrHigher);

  // define color scale
  const colorScale = d3
    .scaleThreshold()
    .domain(
      d3.range(
        minBachelorsOrHigher +
          (maxBachelorsOrHigher - minBachelorsOrHigher) / colors.length,
        maxBachelorsOrHigher -
          (maxBachelorsOrHigher - minBachelorsOrHigher) / colors.length,
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

  // map
  svgMap
    .selectAll("path")
    .attr("class", "counties")
    .data(topojson.feature(usData, usData.objects.counties).features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", path)
    // fill has to use the colorScale from bachelorsOrHigher where usData.id is the same as education.fips
    .attr("fill", (d) => {
      let result = education.filter((i) => {
        return i.fips === d.id;
      });
      if (result[0]) {
        return colorScale(result[0].bachelorsOrHigher);
      } else {
        console.log("no match for: " + d.id);
      }
    })
    .attr("data-education", (d) => {
      let result = education.filter((i) => {
        return i.fips === d.id;
      });
      if (result[0]) {
        return result[0].bachelorsOrHigher;
      }
    })
    .attr("data-fips", (d) => {
      return d.id;
    })
    .on("mouseover", (d) => {
      tooltip.transition().duration(500).style("opacity", 0.8);
      tooltip.attr("data-education", () => {
        let result = education.filter((i) => {
          return i.fips === d.id;
        });
        if (result[0]) {
          return result[0].bachelorsOrHigher;
        }
      });
      tooltip.html(() => {
        let result = education.filter((i) => {
          return i.fips === d.id;
        });
        if (result[0]) {
          return (
            result[0].area_name +
            ", " +
            result[0].state +
            "<br />" +
            result[0].bachelorsOrHigher +
            "%"
          );
        }
      });
      tooltip
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 60 + "px");
    })
    .on("mouseout", function (d) {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  svgMap
    .append("path")
    .datum(
      topojson.mesh(usData, usData.objects.states, function (a, b) {
        return a !== b;
      })
    )
    .attr("class", "states")
    .attr("d", path);
}
