from pathlib import Path

FILE = Path(
    "../data/raw/ocm_2025/"
    "E06_OCM_LAC_15APR2025_105071132054_12597_STGO00GND_55_14_F/"
    "BAND_META.txt"
)

print("=" * 70)
print("NIRVAAH - EOS-06 OCM BAND METADATA CHECK")
print("=" * 70)

# ---------------------------------------------------------
# CHECK FILE
# ---------------------------------------------------------

print("\nFile:")
print(FILE)

print("\nExists:", FILE.exists())

if FILE.exists():

    print("File size:", FILE.stat().st_size, "bytes")

    # -----------------------------------------------------
    # READ COMPLETE FILE
    # -----------------------------------------------------

    text = FILE.read_text(
        errors="ignore"
    )

    print("\nTotal characters:", len(text))

    print("\n" + "=" * 70)
    print("FIRST 150 LINES OF METADATA")
    print("=" * 70)

    lines = text.splitlines()

    for i, line in enumerate(lines[:150], start=1):

        print(
            f"{i:03d}: {line}"
        )

else:

    print("\nERROR: BAND_META.txt was not found!")

print("\n" + "=" * 70)
print("INSPECTION COMPLETE")
print("=" * 70)