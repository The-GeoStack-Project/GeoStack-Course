#!/bin/bash

# Create the user geostack and set the password to geostack
createuser geostack
psql -c "ALTER USER geostack WITH PASSWORD 'geostack';"

# Create the gis database with user: "gis" and add the required
# exstensions to the database
createdb -E UTF8 -O geostack gis 
psql -c "CREATE EXTENSION IF NOT EXISTS postgis;" gis
psql -c "CREATE EXTENSION IF NOT EXISTS postgis_topology;" gis
psql -c "CREATE EXTENSION hstore;" gis
