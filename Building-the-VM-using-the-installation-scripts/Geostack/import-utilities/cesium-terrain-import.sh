#!/bin/sh

# Ask for user input.
echo -n "Please enter the name of the file (WITHOUT THE .TIF extension) that you want to import: "
# Read the user input.
read VAR

# Check if the user input is not empty
if [[ $VAR != '' ]]
then
	# Create a new directory for the Terrain files.
	echo "Creating a new directory"
	mkdir -p ~/Geostack/cesium-server/data/tilesets/terrain/$VAR

	# Tranform the file to WGS84 projection.
	echo "Transforming tif file to WGS84"
	docker run -v ~/Geostack/cesium-server/data:/data geodata/gdal gdalwarp -t_srs EPSG:3857 /data/$VAR.TIF /data/$VAR+3857.TIF

	echo " Running ‘tumgis/ctb-quantized-mesh’, to generate the terrain files"
	docker run -it -v ~/Geostack/cesium-server/data:/data tumgis/ctb-quantized-mesh ctb-tile -f Mesh -C -o /data/tilesets/terrain/$VAR /data/$VAR+3857.TIF

	echo "Creating the layer.json file for Cesium"
	docker run -it -v ~/Geostack/cesium-server/data:/data tumgis/ctb-quantized-mesh ctb-tile -l -f Mesh -C -o /data/tilesets/terrain/$VAR /data/$VAR+3857.TIF

	echo "Done, you can now access the new terrain files via the URL: http://localhost/terrain/$VAR/0/0/0.terrain or http://localhost/tilesets/terrain/$VAR/0/0/0.terrain "
	echo "NOTE: The cesium server should be running when trying to access the terrain files"
fi
