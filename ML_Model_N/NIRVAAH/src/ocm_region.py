import xarray as xr

FILE = (
    "../data/raw/ocm_2025/"
    "E06_OCM_LAC_15APR2025_105071132054_12597_STGO00GND_55_14_F/"
    "BAND.nc"
)

print("=" * 60)
print("NIRVAAH - EOS-06 OCM REGION")
print("=" * 60)

ds = xr.open_dataset(FILE)

lat = ds["latitude"]
lon = ds["longitude"]

print("\nLATITUDE")
print("Min:", float(lat.min()))
print("Max:", float(lat.max()))

print("\nLONGITUDE")
print("Min:", float(lon.min()))
print("Max:", float(lon.max()))

print("\nDATASET SIZE")
print("Latitude:", lat.size)
print("Longitude:", lon.size)

print("\nNIRVAAH KONKAN REGION")
print("Latitude : 15.5 - 21.0")
print("Longitude: 71.5 - 73.5")

print("\nChecking coverage...")

print(
    "Konkan region is inside OCM scene:",
    float(lat.min()) <= 15.5 and float(lat.max()) >= 21.0
    and float(lon.min()) <= 71.5 and float(lon.max()) >= 73.5
)

ds.close()