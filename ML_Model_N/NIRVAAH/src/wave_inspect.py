import xarray as xr

FILE = "../data/raw/wave_data.nc"

print("Opening wave dataset...")

ds = xr.open_dataset(FILE)

print("\n========== DATASET ==========")
print(ds)

print("\n========== DIMENSIONS ==========")
print(ds.dims)

print("\n========== COORDINATES ==========")
print(list(ds.coords))

print("\n========== VARIABLES ==========")
print(list(ds.data_vars))

print("\n========== VARIABLE DETAILS ==========")

for variable in ds.data_vars:
    print("\n--------------------------------")
    print("Variable:", variable)
    print(ds[variable])

print("\n========== TIME RANGE ==========")

if "time" in ds:
    print("Start:", ds["time"].min().values)
    print("End:", ds["time"].max().values)

print("\n========== LATITUDE ==========")

for name in ["latitude", "lat"]:
    if name in ds:
        print(
            name,
            ds[name].min().values,
            "→",
            ds[name].max().values
        )

print("\n========== LONGITUDE ==========")

for name in ["longitude", "lon"]:
    if name in ds:
        print(
            name,
            ds[name].min().values,
            "→",
            ds[name].max().values
        )

ds.close()