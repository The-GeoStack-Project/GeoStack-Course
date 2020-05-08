#!/bin/sh


echo "-------------->>>> Transforming datasets and placing them in the correct place<<<<--------------"
sleep 2

python3 ~/Installation-scripts/root-scripts/dataset-convert.py

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


echo "-------------->>>> DONE <<<<--------------"
