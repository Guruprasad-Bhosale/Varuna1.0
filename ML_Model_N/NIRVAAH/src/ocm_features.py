import xarray as xr
import numpy as np
from pathlib import Path

INPUT_FILE = Path("../data/processed/nirvaah_ocm_region.nc")
OUTPUT_FILE = Path("../data/processed/nirvaah_ocm_features.nc")

print("=" * 70)
print("NIRVAAH - EOS-06 OCM SPECTRAL FEATURE ENGINEERING")
print("=" * 70)

print("\nLoading extracted OCM region...")

ds = xr.open_dataset(INPUT_FILE)

print("Dimensions:")
print(ds.sizes)

# ---------------------------------------------------------
# Load useful bands
# ---------------------------------------------------------

print("\nLoading spectral bands...")

b02 = ds["BAND02"]   # 443 nm
b03 = ds["BAND03"]   # 490 nm
b05 = ds["BAND05"]   # 555 nm
b08 = ds["BAND08"]   # 670 nm
b09 = ds["BAND09"]   # 681 nm
b10 = ds["BAND10"]   # 710 nm
b12 = ds["BAND12"]   # 870 nm

# ---------------------------------------------------------
# Safe ratio function
# ---------------------------------------------------------

def safe_ratio(a, b):
    return xr.where(
        (b != 0) & np.isfinite(a) & np.isfinite(b),
        a / b,
        np.nan
    )

# ---------------------------------------------------------
# Create spectral features
# ---------------------------------------------------------

print("\nCreating spectral features...")

features = xr.Dataset()

features["ocm_b02_443"] = b02
features["ocm_b03_490"] = b03
features["ocm_b05_555"] = b05
features["ocm_b08_670"] = b08
features["ocm_b09_681"] = b09
features["ocm_b10_710"] = b10
features["ocm_b12_870"] = b12

features["ocm_blue_green_ratio"] = safe_ratio(b02, b05)

features["ocm_blue_green_ratio2"] = safe_ratio(b03, b05)

features["ocm_red_edge_ratio"] = safe_ratio(b09, b08)

features["ocm_nir_red_ratio"] = safe_ratio(b10, b09)

features["ocm_green_red_ratio"] = safe_ratio(b05, b08)

features["ocm_nir_green_ratio"] = safe_ratio(b12, b05)

# ---------------------------------------------------------
# Basic statistics
# ---------------------------------------------------------

print("\nFEATURE SUMMARY")
print("-" * 60)

for name in features.data_vars:

    values = features[name].values

    finite = values[np.isfinite(values)]

    if len(finite) == 0:
        print(f"{name}: NO VALID DATA")
        continue

    print(
        f"{name:30s} "
        f"min={np.min(finite):.6f} "
        f"median={np.median(finite):.6f} "
        f"max={np.max(finite):.6f}"
    )

# ---------------------------------------------------------
# Save
# ---------------------------------------------------------

OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

print("\nSaving OCM features...")

features.to_netcdf(OUTPUT_FILE)

print("\n" + "=" * 70)
print("OCM FEATURE ENGINEERING COMPLETE")
print("=" * 70)

print("\nFeatures created:", len(features.data_vars))
print("Saved to:", OUTPUT_FILE)

ds.close()