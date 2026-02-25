#!/usr/bin/env python3
"""
Script to convert white text to black in logo.png
Creates a new version: logo-dark.png
"""
from PIL import Image
import os

# Paths
input_path = '../frontend/public/logo.png'
output_path = '../frontend/public/logo-dark.png'

# Load the image
img = Image.open(input_path)

# Convert to RGBA if not already
img = img.convert('RGBA')

# Get pixel data
pixels = img.load()

# Define threshold for "white" colors
# We'll consider pixels that are mostly white (high RGB values)
WHITE_THRESHOLD = 200

# Iterate through each pixel
for y in range(img.size[1]):
    for x in range(img.size[0]):
        r, g, b, a = pixels[x, y]
        
        # If pixel is mostly white (high RGB values) and not transparent
        if r > WHITE_THRESHOLD and g > WHITE_THRESHOLD and b > WHITE_THRESHOLD and a > 128:
            # Change to black
            pixels[x, y] = (0, 0, 0, a)

# Save the new image
img.save(output_path)
print(f"✓ Created {output_path}")
print(f"  Converted white text to black")
