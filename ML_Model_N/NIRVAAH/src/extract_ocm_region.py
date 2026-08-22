import xarray as xr
from pathlib import Path

INPUT_FILE = (
    "../data/raw/ocm_2025/"
    "E06_OCM_LAC_15APR2025_105071132054_12597_STGO00GND_55_14_F/"
    "BAND.nc"
)

OUTPUT_FILE = Path("../data/processed/nirvaah_ocm_region.nc")

print("=" * 70)
print("NIRVAAH - EOS-06 OCM REGION EXTRACTION")
print("=" * 70)

print("\nLoading OCM dataset...")

ds = xr.open_dataset(INPUT_FILE)

print("Original dimensions:")
print(ds.sizes)

# NIRVAAH region
LAT_MIN = 15.5
LAT_MAX = 20.05
LON_MIN = 71.5
LON_MAX = 73.5

print("\nTarget overlap:")
print(f"Latitude : {LAT_MIN} -> {LAT_MAX}")
print(f"Longitude: {LON_MIN} -> {LON_MAX}")

lat = ds["latitude"]
lon = ds["longitude"]

# Determine coordinate ordering
lat_ascending = float(lat[0]) < float(lat[-1])
lon_ascending = float(lon[0]) < float(lon[-1])

print("\nCoordinate ordering:")
print("Latitude ascending :", lat_ascending)
print("Longitude ascending:", lon_ascending)

# Create slices correctly
if lat_ascending:
    lat_slice = slice(LAT_MIN, LAT_MAX)
else:
    lat_slice = slice(LAT_MAX, LAT_MIN)

if lon_ascending:
    lon_slice = slice(LON_MIN, LON_MAX)
else:
    lon_slice = slice(LON_MAX, LON_MIN)

print("\nExtracting overlap...")

region = ds.sel(
    latitude=lat_slice,
    longitude=lon_slice
)

print("\nExtracted dimensions:")
print(region.sizes)

print("\nExtracted coordinates:")

print(
    "Latitude:",
    float(region.latitude.min()),
    "->",
    float(region.latitude.max())
)

print(
    "Longitude:",
    float(region.longitude.min()),
    "->",
    float(region.longitude.max())
)

# Create output directory
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

print("\nSaving extracted OCM region...")

region.to_netcdf(OUTPUT_FILE)

print("\n" + "=" * 70)
print("OCM REGION EXTRACTION COMPLETE")
print("=" * 70)

print("\nSaved:")
print(OUTPUT_FILE)

print("\nNext:")
print("We will calculate spectral features from the extracted OCM bands.")

ds.close()