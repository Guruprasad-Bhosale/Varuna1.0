import xarray as xr

FILE = (
    "../data/raw/ocm_2025/"
    "E06_OCM_LAC_15APR2025_105071132054_12597_STGO00GND_55_14_F/"
    "BAND.nc"
)

print("=" * 70)
print("NIRVAAH - EOS-06 OCM BAND ATTRIBUTES")
print("=" * 70)

ds = xr.open_dataset(FILE)

for name in ds.data_vars:

    var = ds[name]

    print("\n" + "-" * 60)
    print(f"VARIABLE: {name}")
    print("-" * 60)

    print("Shape:", var.shape)
    print("Dimensions:", var.dims)

    print("\nAttributes:")

    if var.attrs:
        for key, value in var.attrs.items():
            print(f"  {key}: {value}")
    else:
        print("  No attributes")

print("\n" + "=" * 70)
print("INSPECTION COMPLETE")
print("=" * 70)

ds.close()