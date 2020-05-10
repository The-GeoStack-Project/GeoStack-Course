# Pull the Cesium terrain server image.
echo "Downloading Cesium Terrain Server"
docker pull geodata/cesium-terrain-server

# Pull the Memcached image using: "docker pull"
echo "Downloading Memcached"
docker pull memcached

# Create a new directory for the Terrain files.
echo "Creating a new directory for the Hamert DTM terrain files"
sleep 2
mkdir -p ~/Geostack/cesium-server/data/tilesets/terrain/M_52EZ2

# Downloading the Hamert DTM dataset from pdok.nl using a wget command.
# The output directory specified is the directory in which the commands below
# expect the dataset to be. This is done using the -P flag.
#echo "Downloading the Hamert DTM File"
#sleep 2
#wget "https://download.pdok.nl/rws/ahn3/v1_0/05m_dtm/M_52EZ2.ZIP" -P ~/Geostack/cesium-server/data/

# Unzipping the downloaded DTM file in the output directory specified uing the -d flag.
echo "Unzipping the Hamert DTM File"
sleep 2
unzip ~/GeoStack-Course/Course-Datasets/DEM/M_52EZ2.ZIP -d ~/Geostack/cesium-server/data/

# Cleanup by removing the downloaded zip file.
echo "Removing downloaded .zip file"
rm ~/Geostack/cesium-server/data/M_52EZ2.ZIP

# Tranform the file to WGS84 projection.
echo "Transforming Hamert DTM tif file to WGS84"
docker run -v ~/Geostack/cesium-server/data:/data geodata/gdal gdalwarp -t_srs EPSG:3857 /data/M_52EZ2.TIF /data/M_52EZ23857.TIF

# Generating the terrain files using cbt-tile without the -l option.
echo "Running ‘tumgis/ctb-quantized-mesh’, to generate the Hamert DTM terrain files"
docker run -it -v ~/Geostack/cesium-server/data:/data tumgis/ctb-quantized-mesh ctb-tile -f Mesh -C -o /data/tilesets/terrain/M_52EZ2 /data/M_52EZ23857.TIF

# Generating the layer.json file using cbt-tile WITH the -l option.
echo "Creating the Hamert DTM layer.json file for Cesium"
docker run -it -v ~/Geostack/cesium-server/data:/data tumgis/ctb-quantized-mesh ctb-tile -l -f Mesh -C -o /data/tilesets/terrain/M_52EZ2 /data/M_52EZ23857.TIF

# Code below is for doing the same as above but then for the hamer DSM files (so with tree and building heights)
# ------------------------------------------------------------------------------
# # Create a new directory for the Terrain files.
# echo "Creating a new directory for the Hamert DTM terrain files"
# mkdir -p ~/Geostack/cesium-server/data/tilesets/terrain/R_52EZ2
#
# # Tranform the file to WGS84 projection.
# echo "Downloading GDALWarp Transforming Hamert DTM tif file to WGS84"
# docker run -v ~/Geostack/cesium-server/data:/data geodata/gdal gdalwarp -t_srs EPSG:3857 /data/R_52EZ2.TIF /data/R_52EZ23857.TIF
#
# echo " Downloading and Running ‘tumgis/ctb-quantized-mesh’, to generate the Hamert DTM terrain files"
# docker run -it -v ~/Geostack/cesium-server/data:/data tumgis/ctb-quantized-mesh ctb-tile -f Mesh -C -o /data/tilesets/terrain/R_52EZ2 /data/R_52EZ23857.TIF
#
# echo "Creating the Hamert DTM layer.json file for Cesium"
# docker run -it -v ~/Geostack/cesium-server/data:/data tumgis/ctb-quantized-mesh ctb-tile -l -f Mesh -C -o /data/tilesets/terrain/R_52EZ2 /data/R_52EZ23857.TIF

echo "--------->>DONE<<----------"
