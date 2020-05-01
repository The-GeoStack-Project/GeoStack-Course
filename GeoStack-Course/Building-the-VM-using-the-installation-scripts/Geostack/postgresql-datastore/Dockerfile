# The line below creates a layer from the PostgreSQL V. 11 Docker image.
FROM postgres:11

# Set  build environment to the versions required for our PostgreSQL installation.
ENV POSTGIS_MAJOR 2.5 
ENV POSTGISV 2.5

# Download the required packages, software and modules using the environment 
# variables which we set above. After the modules are downloaded, they are 
# unziped and compiled. 
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  postgresql-$PG_MAJOR-postgis-$POSTGISV \
  postgresql-$PG_MAJOR-postgis-$POSTGISV-scripts \
  postgresql-$PG_MAJOR-pgrouting \
  postgresql-$PG_MAJOR-pgrouting-scripts \
  postgresql-server-dev-$PG_MAJOR \
  unzip \
  make \
  && apt-get purge -y --auto-remove postgresql-server-dev-$PG_MAJOR make unzip

# Create a directory in which we will copy the script that creates the database.
RUN mkdir -p /docker-entrypoint-initdb.d

# Copy the script which will run when the container is started for the first time
COPY ./initdb-postgis.sh /docker-entrypoint-initdb.d/postgis.sh

# Set the permissions of the postgis.sh init script. 
RUN chmod 0755 /docker-entrypoint-initdb.d/postgis.sh

