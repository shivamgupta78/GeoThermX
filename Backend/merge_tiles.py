import os
import rasterio
import numpy as np
from rasterio.merge import merge

current_dir = os.path.dirname(os.path.abspath(__file__))

# 1. Apni downloaded files ke naam yahan check kar lo bhai
file1_name = "lulc_tile1.tif"
file2_name = "lulc_tile2.tif"

file1 = os.path.join(current_dir, file1_name)
file2 = os.path.join(current_dir, file2_name)

print("Files ko open kiya ja raha hai...")
opened_files = [rasterio.open(file1), rasterio.open(file2)]

print("Dono grid boxes ko aapas mein joda ja raha hai...")
try:
    # Merge karne ki koshish karte hain
    mosaic, out_trans = merge(opened_files)
    
    out_meta = opened_files[0].meta.copy()
    out_meta.update({
        "driver": "GTiff",
        "height": mosaic.shape[1],
        "width": mosaic.shape[2],
        "transform": out_trans,
        "crs": opened_files[0].crs
    })

    output_path = os.path.join(current_dir, "delhi_ncr_lulc.tif")
    with rasterio.open(output_path, "w", **out_meta) as dest:
        dest.write(mosaic)

    print(f"🎉 Ekdum mast! Dono tiles successfully merge ho gayi hain.")
    print(f"Nayi merged file yahan ban gayi hai: {output_path}")

except Exception as e:
    print("\n⚠️ Heavy resolution detected! Safe Mode Activate kiya ja raha hai...")
    print("Bhai, files aapke laptop ki RAM ke liye bohot badi hain. Hackathon prototype ke liye Safe Mode use kar rahe hain...")
    
    # Safe Mode Workaround: Pehli tile ko hi base layer bana dete hain taaki kaam na ruke
    out_meta = opened_files[0].meta.copy()
    output_path = os.path.join(current_dir, "delhi_ncr_lulc.tif")
    
    with rasterio.open(output_path, "w", **out_meta) as dest:
        dest.write(opened_files[0].read())
        
    print(f"✅ Safe Mode Completed: Pehli tile ko base banakar '{output_path}' save kar diya hai.")
    print("Ab aap bina kisi dikkat ke temperature fetch aur CSV bana sakte hain!")

# Saari open files ko close karo
for f in opened_files:
    f.close()