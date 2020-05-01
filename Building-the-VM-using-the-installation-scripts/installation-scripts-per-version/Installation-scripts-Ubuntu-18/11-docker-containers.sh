#!/bin/sh
echo "-------------->>>> Installing xterm terminal <<<<--------------"
sudo apt install xterm

echo "-------------->>>> Creating the docker containers<<<<--------------"
echo "-------------->>>> Running docker-compose build <<<<--------------"
sleep 2
# Enter the Geostack directory and run docker-compose build.
cd ~/Geostack && docker-compose build 

echo "-------------->>>> Running compose up to start and init containers <<<<--------------"
echo "-------------->>>> When prompted enter the password: geostack <<<<--------------"
sleep 5
xterm -hold -e 'service mongodb stop && service postgresql stop && service nginx stop && cd ~/Geostack && docker-compose up' &> /dev/null &

echo "The system is now waiting 2 minutes to make sure the Docker containers are up and running and the Dockerized databases are initialized"

echo "After the 120 seconds the data import process will start. If you missed the 2 minute mark you should rerun this script!"

for i in {0..120}; do echo -ne "$i"'\r'; sleep 1; done; echo "Starting dataset import process"

echo "-------------->>>> Importing and indexing Crane datasets <<<<--------------"
sleep 2

# Run the Python script used to import all the Crane datasets.
python3 ~/Geostack/import-utilities/crane-datasets-import.py


echo "-------------->>>> Importing and indexing GPS-Route (Trail) datasets <<<<--------------"
sleep 2

# Run the Python script used to import all the GPS-Route (Trail) datasets.
python3 ~/Geostack/import-utilities/trail-datasets-import.py


echo "-------------->>>> Importing and indexing World Port Index dataset <<<<--------------"
sleep 2

# Run the Python script used to import the World Port Index dataset.
python3 ~/Geostack/import-utilities/world-port-index-import.py

echo "-------------->>>> Importing OSM Data from the dutch province: Limburg <<<<--------------"
sleep 2

osm2pgsql -d gis -H localhost -P 5432 -U geostack -W --create --slim -G --hstore --tag-transform-script ~/Geostack/tilestache-server/openstreetmap-carto/openstreetmap-carto.lua -C 2500 --number-processes 4 -S ~/Geostack/tilestache-server/openstreetmap-carto/openstreetmap-carto.style /home/geostack/Geostack/datasets/OSM/limburg-latest.osm.pbf

echo "-------------->>>> DONE <<<<--------------"
sleep 2
