import os
import json
from PIL import Image

def generate_bboxes(root_dir, output_js_path, threshold=10):
    bboxes = {}
    
    # Walk through the directories and find PNG files under Items/
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.lower().endswith('.png'):
                full_path = os.path.join(root, file)
                # Get the relative path (to match how it is referenced in JS, e.g. Items/Hair/xxx.png)
                rel_path = os.path.relpath(full_path, root_dir).replace('\\', '/')
                
                # Only process items under Items/ directory
                if not rel_path.startswith('Items/'):
                    continue
                
                try:
                    with Image.open(full_path) as img:
                        # Convert to RGBA to handle all formats (including P mode) and get alpha channel
                        img_rgba = img.convert('RGBA')
                        alpha = img_rgba.split()[-1]
                        
                        # Threshold the alpha channel to ignore noise
                        alpha_thresh = alpha.point(lambda p: 255 if p > threshold else 0)
                        bbox = alpha_thresh.getbbox()
                        
                        if bbox:
                            left, upper, right, lower = bbox
                            bboxes[rel_path] = {
                                "x": left,
                                "y": upper,
                                "w": right - left,
                                "h": lower - upper
                            }
                except Exception as e:
                    print(f"Error processing {file}: {e}")
                    
    # Write the output file as a JS constant
    with open(output_js_path, 'w', encoding='utf-8') as f:
        f.write("// Automatically generated bounding boxes\n")
        f.write("const ITEM_BBOXES = ")
        json.dump(bboxes, f, indent=2)
        f.write(";\n")

if __name__ == '__main__':
    generate_bboxes('.', './bboxes.js')
    print("Bounding boxes generated successfully in bboxes.js")
