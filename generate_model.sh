#!/bin/bash

# generate_model.sh
# Automates the creation of a 3D model from a single image using StableFast3D
# Usage: ./generate_model.sh <path_to_input_image> <item_id>
# Example: ./generate_model.sh public/images/tim_hortons_cup.svg tim_hortons_cup

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <path_to_input_image> <output_name_without_extension>"
    echo "Example: $0 public/images/tim_hortons_cup.png tim_hortons_cup"
    exit 1
fi

INPUT_IMAGE="$1"
OUTPUT_NAME="$2"
OUTPUT_DIR="public/models"

# Source the .env file if it exists, to load HF_TOKEN securely
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "Loaded environment variables from .env"
fi

if [ -z "$HF_TOKEN" ] && [ "$HF_TOKEN" != "your_hugging_face_token_here" ]; then
    echo "Warning: HF_TOKEN is not set or keeps its default value in .env."
    echo "Please edit the .env file in the root directory and add your Hugging Face token."
    echo "Example: HF_TOKEN=hf_xxxxxxx..."
    echo "This is required to download the SF3D model weights securely."
    exit 1
fi

# Check if sf3d directory exists
if [ ! -d "sf3d" ]; then
    echo "Error: sf3d directory not found. Did you clone StableFast3D into 'sf3d'?"
    exit 1
fi

# Check if input image exists
if [ ! -f "$INPUT_IMAGE" ]; then
    echo "Error: Input image '$INPUT_IMAGE' not found."
    exit 1
fi

echo "============================================="
echo "Generating 3D Model: $OUTPUT_NAME.glb"
echo "Input Image: $INPUT_IMAGE"
echo "============================================="

# Create output dir if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Run StableFast3D from inside its directory
# The model creates an 'output' folder inside sf3d/ and places a .glb there
cd sf3d || exit 1

# Explicitly login to Hugging Face CLI using the token we loaded
echo "Authenticating with Hugging Face..."
python3 -m huggingface_hub.commands.huggingface_cli login --token "$HF_TOKEN"

# Clear any previous runs that might have crashed
rm -rf output/0/mesh.glb

echo "Running StableFast3D inference..."
# Handle Apple Silicon MPS missing operators fallback
export PYTORCH_ENABLE_MPS_FALLBACK=1

# Bypass Numba caching permission errors on Mac
export NUMBA_CACHE_DIR=/tmp/numba_cache

# Force CPU to save memory for the user (Memory spike up to 11.5GB on MPS)
export SF3D_USE_CPU=1

# Disable CoreML Execution Provider to prevent ONNX Runtime model saving crash
export ORT_DISABLE_COREML=1

# Using the output of python run.py, skipping rembg since our image is already transparent
python3 run.py ../"$INPUT_IMAGE" --output-dir output/ --no-rembg

# StableFast3D saves the result inside a subfolder index (0 if only one image)
# return back to project root
cd ..

NEW_MODEL_PATH="sf3d/output/0/mesh.glb"

if [ -f "$NEW_MODEL_PATH" ]; then
    echo "Model generated successfully! Moving to $OUTPUT_DIR/$OUTPUT_NAME.glb"
    mv "$NEW_MODEL_PATH" "$OUTPUT_DIR/$OUTPUT_NAME.glb"
    
    # Clean up the output folder
    rm -rf sf3d/output/0
    echo "Done! The 3D model is ready at $OUTPUT_DIR/$OUTPUT_NAME.glb"
else
    echo "Error: Expected model output not found at $NEW_MODEL_PATH."
    echo "Did the generation script fail? (Check logs above for HuggingFace token or memory errors)"
    exit 1
fi
