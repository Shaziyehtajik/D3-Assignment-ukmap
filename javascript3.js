// Set the initial values for height, width, and number of cities displayed
const screenHeight = 800;
const screenWidth = 1400;
let displayedCityCount = 5;
let cityDataList = [];

// Choose the "map" element and generate the SVG container
const mainContainer = d3.select("#map").attr("class", "main-container");
const svgContainer = mainContainer
  .append("div")
  .attr("class", "svg-container")
  .append("svg")
  .attr("height", screenHeight)
  .attr("width", screenWidth)
  .append("g")
  .attr("id", "svg_id");

// Define the projection and path for rendering geographical data
const geoProjection = d3
  .geoNaturalEarth1()
  .translate([screenWidth / 2, screenHeight / 2])
  .scale(4000)
  .center([-4.5, 55]);
const geoPath = d3.geoPath().projection(geoProjection);

// Load the geographical data from a JSON file
d3.json("https://yamu.pro/gb.json", function (error, mapData) {
  if (error) {
    console.log(error);
    return;
  }
  // Render the geographical features on the map
  svgContainer
    .selectAll(".land")
    .data(mapData.features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", geoPath)
    .append("title")
    .text("UK");
});

// Function to sort the city data by population
const sortCityData = (data) => {
  return data.sort((a, b) => a.Population - b.Population);
};

// Function to create tooltip information within a container
const generateTooltip = (container, text, customClass = "", x = 6, y = 24) => {
  return container
    .append("text")
    .text(text)
    .attr("class", customClass)
    .attr("x", x)
    .attr("y", y);
};

// Function to format a number with thousands separators
const formatPopulationNumber = (number) => {
  return new Intl.NumberFormat().format(number);
};

// Function to render the map with city data
const renderCityMap = () => {
  svgContainer.selectAll(".data-group").remove();

  // Fetch city data from an API based on the number of cities to be displayed
  d3.json(`http://34.38.72.236/Circles/Towns/0${displayedCityCount}`, function (error, data) {
    if (error) {
      console.log(error);
      return;
    }

    // Sort the city data by population
    cityDataList = sortCityData(data);

   // Create groups for each city, handle mouse events, and display tooltips
const cityGroup = svgContainer
.selectAll(".data-group")
.data(data)
.enter()
.append("g")
.attr("class", "data-group")
.on("mouseenter", (d) => {
  // Display a tooltip when the mouse enters the city
  const tooltip = svgContainer
    .append("div")
    .attr("class", "tooltip-container")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "10px")
    .style("border", "1px solid #ddd")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  tooltip
    .html(`<strong>${d.Town}</strong><br>Population: ${formatPopulationNumber(d.Population)}`)
    .style("left", `${d3.event.pageX}px`)
    .style("top", `${d3.event.pageY}px`);

  // Highlight the city on mouseenter
  d3.select(this).attr("class", "highlighted");
})
.on("mouseleave", (d) => {
  // Remove the tooltip and reset city highlighting on mouseleave
  svgContainer.selectAll(".tooltip-container").remove();
  d3.select(this).attr("class", (d) => `towns ${d.Town}`);
});


   // Render circles and labels for each city
cityGroup
.append("circle")
.attr("class", (d) => `towns ${d.Town}`)
.attr("r", 7)
.attr("transform", (d) => `translate(${geoProjection([d.lng, d.lat])})`);

cityGroup
.append("text")
.attr("class", "text-label")
.attr("transform", (d) => `translate(${geoProjection([d.lng, d.lat])})`)
.attr("dy", -10) // Adjust the vertical position of the text
.text((d) => d.Town)
.style("opacity", 0) // Set initial opacity to 0
.transition()
.duration(1400)
.style("opacity", 1); // Transition to opacity 1

  });
};

// Create the side container for city information and controls
const controlPanel = mainContainer.append("div").attr("class", "Control Panel");
controlPanel
  .append("h3")
  .text("Adjust City Display via Slider")
  .attr("class", "header");

const cityInfoContainer = controlPanel.append("div");
const buttonContainer = controlPanel.append("div");

// Create an input range element for adjusting the number of cities displayed
const citySlider = cityInfoContainer
  .append("input")
  .attr("type", "range")
  .attr("max", "500")
  .attr("min", "0")
  .attr("value", displayedCityCount)
  .attr("step", "5")
  .on("input", () => {
    // Update the number of cities displayed
    displayedCityCount = parseInt(citySlider.node().value);
    showCityCount(displayedCityCount);
  })
  .on("change", () => {
    // Re-render the map with the updated number of cities displayed
    renderCityMap();
  });

// Function to display the number of cities selected
const showCityCount = (num) => {
  cityInfoContainer.selectAll("h3").remove();
  cityInfoContainer.append("h3").text(num + " Cities").attr("class", "Number of Cities");
};

// Add a button to trigger random city distribution
buttonContainer
  .append("div")
  .append("button")
  .text("Randomly Distribute Cities")
  .attr("class", "btn")
  .on("click", () => renderCityMap());

// Add a header with your name and student ID
controlPanel
  .append("h3")
  .text("SHAZIYEH TAJIK 2574012")
  .attr("class", "header1");

// Initial rendering of the map and city count
renderCityMap();
showCityCount(displayedCityCount);
