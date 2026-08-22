import xarray as xr

FILE = "../data/raw/ocm_2025/E06_OCM_LAC_15APR2025_105071132054_12597_STGO00GND_55_14_F/BAND.nc"

print("=" * 60)
print("NIRVAAH - EOS-06 OCM RRS INSPECTION")
print("=" * 60)

print("\nOpening BAND.nc...")

ds = xr.open_dataset(FILE)

print("\n========== DATASET ==========")
print(ds)

print("\n========== DIMENSIONS ==========")
print(ds.dims)

print("\n========== COORDINATES ==========")
print(list(ds.coords))

print("\n========== VARIABLES ==========")
print(list(ds.data_vars))

print("\n========== ATTRIBUTES ==========")

for key, value in ds.attrs.items():
    print(f"{key}: {value}")

print("\n========== VARIABLE DETAILS ==========")

for variable in ds.data_vars:
    print("\nVariable:", variable)
    print(ds[variable])

print("\n" + "=" * 60)
print("OCM INSPECTION COMPLETE")
print("=" * 60)