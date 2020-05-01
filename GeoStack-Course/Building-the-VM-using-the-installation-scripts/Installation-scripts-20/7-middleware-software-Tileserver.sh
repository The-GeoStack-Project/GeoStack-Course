#!/bin/sh


sudo add-apt-repository "deb http://nl.archive.ubuntu.com/ubuntu/ bionic main restricted universe multiverse"

sudo apt update

echo "-------------->>>> Installing tilestache & pillow <<<<--------------"
sleep 2

# Install Tilestache Pillow and Gunicorn2 python-packages.
pip3 install tilestache pillow gunicorn

echo "-------------->>>> Installing Mapnik <<<<--------------"
sleep 2
# Install Mapnik
sudo apt install libmapnik-dev mapnik-utils python3-mapnik

echo "-------------->>>> Installing missing fonts <<<<--------------"
sleep 2
# Install the required fonts for OpenStreetMap-Carto
sudo apt install fonts-noto-cjk fonts-noto-hinted fonts-noto-unhinted ttf-unifont


echo "-------------->>>> Downloading OpenStreetMap-carto <<<<--------------"
sleep 2

# Enter the Tilestache Server directory and clone the OpenStreetMap Carto Github Repo.
cd ~/Geostack/tilestache-server/ && git clone git://github.com/gravitystorm/openstreetmap-carto.git

echo "-------------->>>> Installing OpenStreetMap-carto <<<<--------------"
sleep 2
# Enter the OpenStreetMap Carto folder and install the node-modules.
cd ~/Geostack/tilestache-server/openstreetmap-carto && sudo npm install -g carto

echo "-------------->>>> Getting shapefile for OSM base map <<<<--------------"
sleep 2
# Downloading the openstreetmap base map shapefiles.
python3 ~/Geostack/tilestache-server/openstreetmap-carto/scripts/get-shapefiles.py

echo "-------------->>>> Creating the style.xml file <<<<--------------"
sleep 2
# Copy the project.mml file to the correct location
cp ~/Geostack/tilestache-server/project.mml ~/Geostack/tilestache-server/openstreetmap-carto/

# Run OSM Carto to generate the style.xml file using the database settings in the project.mml file
carto  ~/Geostack/tilestache-server/openstreetmap-carto/project.mml > ~/Geostack/tilestache-server/openstreetmap-carto/style.xml
#
echo "-------------->>>> Installing osm2pgsql <<<<--------------"
sleep 2

# Clone the osm2pgsql github repo.
cd ~/Geostack/tilestache-server && git clone git://github.com/openstreetmap/osm2pgsql.git

# Install the required packages for osm2pgsql.
sudo apt install make cmake g++ libboost-dev libboost-system-dev libboost-filesystem-dev libexpat1-dev zlib1g-dev libbz2-dev libpq-dev libgeos-dev libgeos++-dev libproj-dev lua5.2 liblua5.2-dev

# Enter the osm2osm2pgsql directory and create a a build directory.
cd osm2pgsql && mkdir build

# Enter the build directory, build the osm2pgsql modules and install the modules.
cd build && cmake .. && make && sudo make install


echo "-------------->>>> Installing Java for OpenSeaMap renderer <<<<--------------"
sleep 2
# Add the Java ppa to the systems repository list.
sudo add-apt-repository ppa:openjdk-r/ppa

# Update the local database.
sudo apt update

# Install Java 8
sudo apt-get install openjdk-8-jdk

# Install libbatik (Required for the OpenSeaMap renderer) and ant.
sudo apt install libbatik-java ant

echo "-------------->>>> Creating GIS user <<<<--------------"

# Create a PostgreSQL user and set the password to geostack.
sudo su postgres <<EOF
createuser geostack
psql -c "ALTER USER geostack WITH PASSWORD 'geostack';"
EOF

# Create a gis database.
echo "-------------->>>> Creating GIS database <<<<--------------"
# Login to the postgres user and add the PostGIS extensions to the gis database.
sudo su postgres <<EOF
createdb -E UTF8 -O geostack gis
psql -c "CREATE EXTENSION IF NOT EXISTS postgis;" gis
psql -c "CREATE EXTENSION IF NOT EXISTS postgis_topology;" gis
psql -c "CREATE EXTENSION hstore;" gis
EOF
sleep 2

echo "-------------->>>> Importing OSM Data from Limburg <<<<--------------"
echo "-------------->>>> Enter password geostack when prompted <<<<--------------"
sleep 2

# Run the import command to import the OSM data in the gis database.
osm2pgsql -d gis -H localhost -P 5432 -U geostack -W --create --slim -G --hstore --tag-transform-script ~/Geostack/tilestache-server/openstreetmap-carto/openstreetmap-carto.lua -C 2500 --number-processes 4 -S ~/Geostack/tilestache-server/openstreetmap-carto/openstreetmap-carto.style /home/geostack/Geostack/datasets/OSM/limburg-latest.osm.pbf


echo "-------------->>>> DONE <<<<--------------"
