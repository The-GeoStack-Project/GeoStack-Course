FROM ubuntu:18.04

## Install git pip npm nodejs and mapnik
RUN apt-get update \
  && DEBIAN_FRONTEND="noninteractive" apt-get install -y -f git nodejs npm mapnik-utils python3-mapnik python3-pip mapnik-utils python3 \
  && rm -rf /var/lib/apt/lists/*

## Create folder structure
RUN mkdir tilestache && mkdir tilestache/cache 

# Install the required python modules and libraries
COPY requirements.txt /
RUN pip3 install  -r requirements.txt

# Clone the Openstreetmap carto github repo
RUN cd tilestache && git clone git://github.com/gravitystorm/openstreetmap-carto.git

# Install openstreetmap carto 
RUN cd /tilestache/openstreetmap-carto && npm install -g carto

# Install shapefiles for the OSM base Map 
RUN python3 /tilestache/openstreetmap-carto/scripts/get-shapefiles.py

# Copy the project.mml file
COPY project-docker.mml /tilestache/openstreetmap-carto/project.mml

# run carto to create our osm styles from db
RUN carto /tilestache/openstreetmap-carto/project.mml > /tilestache/openstreetmap-carto/style.xml

# Copy tilestache config
COPY tilestache-configuration.cfg /tilestache/

# Copy the index.html
COPY entries.html /tilestache/

