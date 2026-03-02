#!/bin/bash

# Voyage 3D Model Compressor
# Usage: ./scripts/compress.sh <filename.glb>

FILE=$1

if [ -z "$FILE" ]; then
    echo "Error: Please provide a filename."
    echo "Usage: ./scripts/compress.sh my-model.glb"
    exit 1
fi

if [ ! -f "$FILE" ]; then
    echo "Error: File '$FILE' not found."
    exit 1
fi

echo "--- VOYAGE ASSET OPTIMIZER ---"
echo "Target: $FILE"
echo "Original size: $(du -h "$FILE" | cut -f1)"

# Use npx to run gltf-pipeline with more aggressive settings
# -d: Draco compression
# -b: Binary output
# --draco.compressionLevel 10: Max compression level
# --stats: Show detailed statistics
BASENAME=$(basename "$FILE")
OUTPUT="compressed_${BASENAME}"

echo "Optimizing... (Applying Draco + Aggressive compression)"
npx -y gltf-pipeline -i "$FILE" -o "$OUTPUT" -d --draco.compressionLevel 10 -b

if [ $? -eq 0 ]; then
    echo "Success! Compressed version created: $OUTPUT"
    echo "New size: $(du -h "$OUTPUT" | cut -f1)"
    echo "----------------------------"
    echo "You can now upload $OUTPUT via the Admin UI."
else
    echo "Error: Compression failed. Make sure you have Node.js installed."
fi
