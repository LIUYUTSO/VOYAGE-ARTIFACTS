# 3D Model Guidelines for Blender

## Optimal Model Size
- Height: 2-3 Blender units
- Width: 2-3 Blender units
- Depth: 2-3 Blender units

## Camera Settings (Three.js)
- Position: [0, 0, 5]
- FOV: 45 degrees

## Export Settings
1. Format: glTF/GLB
2. Origin: Bottom center of the model
3. Apply All Transforms before export
4. Model orientation: Face Y-axis positive (Blender -Y axis maps to Three.js Z axis)

## Current Scene Settings
- Ambient Light: intensity 5.0
- Directional Light: intensity 2.0, position [5, 5, 5]
- Model scale: 1 