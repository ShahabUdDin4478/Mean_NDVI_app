var region = /* color: #d63000 */ee.Geometry.Polygon(
        [[[69.16164928262411, 23.341183439319224],
          [80.06008678262411, 35.11895321141716],
          [73.38039928262411, 37.52622732298072],
          [61.42727428262411, 29.934883049937014],
          [61.42727428262411, 24.945160052158094]]]);



// Fetch a MODIS NDVI collection and select NDVI.
var col = ee.ImageCollection('MODIS/006/MOD13A2').select('NDVI');

// Define a mask to clip the NDVI data by.
var mask = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
  .filter(ee.Filter.eq('country_na', 'Pakistan'));



// Add day-of-year (DOY) property to each image.
col = col.map(function(img) {
  var doy = ee.Date(img.get('system:time_start')).getRelative('day', 'year');
  return img.set('doy', doy);
});

// Get a collection of distinct images by 'doy'.
var distinctDOY = col.filterDate('2013-01-01', '2014-01-01');

// Define a filter that identifies which images from the complete
// collection match the DOY from the distinct DOY collection.
var filter = ee.Filter.equals({leftField: 'doy', rightField: 'doy'});

// Define a join.
var join = ee.Join.saveAll('doy_matches');

// Apply the join and convert the resulting FeatureCollection to an
// ImageCollection.
var joinCol = ee.ImageCollection(join.apply(distinctDOY, col, filter));

// Apply median reduction among matching DOY collections.
var comp = joinCol.map(function(img) {
  var doyCol = ee.ImageCollection.fromImages(
    img.get('doy_matches')
  );
  return doyCol.reduce(ee.Reducer.median());
});

// Define RGB visualization parameters.
var visParams = {
  min: 0.0,
  max: 9000.0,
  palette: [
    'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901',
    '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01',
    '012E01', '011D01', '011301'
  ],
};

// Create RGB visualization images for use as animation frames.
var rgbVis = comp.map(function(img) {
  return img.visualize(visParams).clip(mask);
});

// Define GIF visualization arguments.
var gifParams = {
  'region': region,
  'dimensions': 600,
  'crs': 'EPSG:3857',
  'framesPerSecond': 10,
  'format': 'gif'
};

// Print the GIF URL to the console.
print(rgbVis.getVideoThumbURL(gifParams));

// Render the GIF animation in the console.
print(ui.Thumbnail(rgbVis, gifParams));
