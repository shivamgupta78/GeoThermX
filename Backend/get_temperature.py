import sys
import os

# 🔥 WINDOWS HACK: fcntl error ko bypass karne ke liye fake module banana
if sys.platform == 'win32':
    import types
    mock_fcntl = types.ModuleType('fcntl')
    mock_fcntl.ioctl = lambda *args, **kwargs: 0
    sys.modules['fcntl'] = mock_fcntl

import ee
import rasterio
from shapely.geometry import box

# Earth Engine Initialize
try:
    ee.Initialize()
    print("GEE Connected successfully!")
except Exception as e:
    print("Authenticate nahi hua bhai! Run 'earthengine authenticate' first.")
    exit()

current_dir = os.path.dirname(os.path.abspath(__file__))
lulc_file = os.path.join(current_dir, "delhi_ncr_lulc.tif")

with rasterio.open(lulc_file) as src:
    bounds = src.bounds
    ncr_geojson = box(bounds.left, bounds.bottom, bounds.right, bounds.top).__geo_interface__
    roi = ee.Geometry(ncr_geojson)

print("Google Cloud par Delhi NCR ka temperature calculate ho raha hai...")

landsat = (
    ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterBounds(roi)
    .filterDate('2025-05-01', '2025-06-30')
    .filter(ee.Filter.lt('CLOUD_COVER', 10))
)

image = landsat.median()
thermal_band = image.select('ST_B10')
lst_celsius = thermal_band.multiply(0.00341802).add(149.0).subtract(273.15).clip(roi)

url = lst_celsius.getDownloadURL({
    'scale': 30,
    'crs': 'EPSG:4326',
    'format': 'GEO_TIFF'
})

print("\n🎉 Pura NCR ka Temperature Data taiyar hai!")
print("Niche diye gaye link par click karke file download karle aur naam 'delhi_ncr_lst.tif' rakh dena:")
print(url)