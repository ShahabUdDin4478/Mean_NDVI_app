var sentinel = ee.ImageCollection("COPERNICUS/S2_SR"),
    region = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[71.79637080707109, 30.524702990562666],
          [71.79637080707109, 29.8838098666355],
          [72.81260615863359, 29.8838098666355],
          [72.81260615863359, 30.524702990562666]]], null, false);
          
          // change years as required
// import images
//Select and Filter Sentinel 2  Image
var sentImage = ee.Image(sentinel
.filterDate("2019-05-01", "2019-07-29")
.sort('CLOUD_COVERAGE_ASSESSMENT')
.filterBounds(region)
);
print("Sentinel 2 Scene", sentImage);

var img2020 = ee.Image("COPERNICUS/S2_SR/20200614T054639_20200614T054940_T43RBP");
var img2019 = ee.Image("COPERNICUS/S2_SR/20190610T054649_20190610T060046_T43RBP");


var NAMES = [
  'July 2019',
  'July 2020',
];


var IMAGES = [img2019,img2020];

var VIS_PARAMS = [
  {gamma:1.3,min: 0, max: 3000, bands: ['B4','B3','B2']},
  {gamma:1.3,min: 0, max: 3000, bands: ['B4','B3','B2']},
];

// Create a map for each visualization option.
var maps = [];
NAMES.forEach(function(name, index) {
  var map = ui.Map();
  map.add(ui.Label(name));
  map.addLayer(IMAGES[index], VIS_PARAMS[index], name);
  map.setControlVisibility(false);
  maps.push(map);
});

var linker = ui.Map.Linker(maps);

// Enable zooming on the top-left map.
maps[0].setControlVisibility({zoomControl: true});

// Show the scale (e.g. '500m') on the bottom-right map.
maps[1].setControlVisibility({scaleControl: true});

// Create a title.
var title = ui.Label('Possible Drought in Multan, Pakistan?', {
  stretch: 'horizontal',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '24px'
});

// Create a grid of maps.
var mapGrid = ui.Panel(
  [
    ui.Panel([maps[0]], null, {stretch: 'both'}),
    ui.Panel([maps[1]], null, {stretch: 'both'})
  ],
  ui.Panel.Layout.Flow('horizontal'), {stretch: 'both'}
);

// Add the maps and title to the ui.root.
ui.root.widgets().reset([title, mapGrid]);
ui.root.setLayout(ui.Panel.Layout.Flow('vertical'));
maps[0].centerObject(img2019, 12);
