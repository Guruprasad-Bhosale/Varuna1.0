import xarray as xr

FILE = "../data/raw/ocm_2025/E06_OCM_LAC_15APR2025_105071132054_12597_STGO00GND_55_14_F/BAND.nc"

print("=" * 60)
print("NIRVAAH - EOS-06 OCM SHORT INSPECTION")
print("=" * 60)

ds = xr.open_dataset(FILE)

print("\nDIMENSIONS")
print(ds.sizes)

print("\nCOORDINATES")
for name in ds.coords:
    print(f"- {name}: {ds[name].shape}")

print("\nVARIABLES")
for name in ds.data_vars:
    var = ds[name]
    print(f"- {name}")
    print(f"  shape : {var.shape}")
    print(f"  dims  : {var.dims}")
    print(f"  dtype : {var.dtype}")

print("\nGLOBAL ATTRIBUTES")
for key, value in ds.attrs.items():
    print(f"- {key}: {value}")

print("\n" + "=" * 60)
print("INSPECTION COMPLETE")
print("=" * 60)

ds.close()