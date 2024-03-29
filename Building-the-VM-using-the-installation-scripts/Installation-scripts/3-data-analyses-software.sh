#!/bin/sh

echo "-------------->>>> Installing Jupyter Lab <<<<--------------"
sleep 2
# Install Jupyter
sudo -H pip3 install jupyterlab

echo "-------------->>>> Installing Pandas <<<<--------------"
sleep 2
# Install packages required for pandas and cartopy
sudo apt-get install libproj-dev proj-data proj-bin libgeos-dev
# Install Pandas.
pip3 install pandas

echo "-------------->>>> Installing Pandas Profiling <<<<--------------"
sleep 2
# Install Pandas Profiling
sudo -H pip3 install pandas-profiling

echo "-------------->>>> Installing GeoPandas <<<<--------------"
sleep 2
# Install GeoPandas
sudo -H pip3 install geopandas

echo "-------------->>>> Installing Cartopy <<<<--------------"
sleep 2
# Install cython before cartopy since it's a dependency for cartopy.
sudo -H pip3 install cython
# Install cartopy matplotlib and scipy.
sudo -H pip3 install matplotlib scipy

# Install Cartopy
sudo -H pip3 install git+https://github.com/SciTools/cartopy.git --no-binary cartopy


echo "-------------->>>> Installing Tkinter GUI TOOL <<<<--------------"
sleep 2
# Install Tkinter
sudo apt-get install python3-tk

echo "-------------->>>> Installing GPXPY <<<<--------------"
sleep 2
# Install GPXPY geopy and numpy
pip3 install gpxpy geopy numpy

echo "-------------->>>> DONE <<<<--------------"
sleep 2
