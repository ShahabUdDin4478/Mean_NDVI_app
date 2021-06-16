/* Define point of interest to spatially filter data
ee.Geometry.Point() function as demonstrated here.*/

/* Import the Landsat 8 Surface Reflectance image collection. */
var l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR');

/* Get the least cloudy image in May 2021. */
var image = ee.Image(l8.filterBounds(point)
  .filterDate('2021-05-01', '2021-05-31')
  .sort('CLOUD_COVER')
  .first()).clip(point);

/* View selected image metadata */
print(image)

/* Select and rename bands */
image = image.select(['B5','B4','B2'],['nir','red','blue']);

/* Compute the Normalized Difference Vegetation Index (NDVI).
NDVI = (NIR - Red) / (NIR + Red) */
//var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
var ndvi = image.normalizedDifference(['nir','red']);

// Display NDVI results.
var ndviParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};
Map.addLayer(ndvi, ndviParams, 'NDVI image');

/* Compute and display Enhanced Vegetation Index (EVI)
EVI = 2.5 * ((NIR - Red) / (NIR + 6 * Red – 7.5 * Blue + 1)) */
var evi = image.expression(
   '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
     'NIR': image.select('nir'),
     'RED': image.select('red'),
      'BLUE': image.select('blue')});


var eviParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};
Map.addLayer(evi, eviParams, 'EVI image');

/* Compute and display Soil-Adjusted Vegetation Index (SAVI)
SAVI = ((NIR - Red) / (NIR + Red + 0.5)) * 1.5 */
var savi = image.expression(
 '((NIR - RED) / (NIR + RED + 0.5)) * 1.5', {
  'NIR':image.select('nir'),
  'RED':image.select('red') });


var saviParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};
Map.addLayer(savi, saviParams, 'SAVI image');
Map.centerObject(image, 9);


/* Mapping an index over a collection. */
/* Define a function that produces index */
var indices =  function (image){
 image = image.select(['B5','B4','B2'],['nir','red','blue']);
  var evi = image.expression(
      '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
       'NIR': image.select('nir'),
       'RED': image.select('red'),
       'BLUE': image.select('blue')
  }).rename('EVI');
  return image.addBands(evi)};

var collection =  l8.filterBounds(point)
  .filterDate('2021-01-01', '2021-05-31')
   .filterMetadata('CLOUD_COVER_LAND','less_than',20)
    .sort('CLOUD_COVER')
  .map(indices);
    
print(collection);

Map.addLayer(evi, eviParams, 'EVI Collection image');
