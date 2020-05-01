# Here we define the Local URI of our Crane Database.
# Uncomment this line if you are going to run the MongoDB instance locally.
#CRANE_DATABASE_URI = "mongodb://localhost:27017/Crane_Database"

# Here we define the Docker URI of our Crane Database.
# Uncomment this line if you are going to run the MongoDB instance in Docker.
CRANE_DATABASE_URI = "mongodb://mongodb-datastore:27017/Crane_Database"


# Here we define the Local URI of our Trail Database.
# Uncomment this line if you are going to run the MongoDB instance locally.
#TRAIL_DATABASE_URI = "mongodb://localhost:27017/Trail_Database"

# Here we define the Docker URI of our Trail Database.
# Uncomment this line if you are going to run the MongoDB instance in Docker.
TRAIL_DATABASE_URI = "mongodb://mongodb-datastore:27017/Trail_Database"

# Here we define the Local URI of our Tilestache Server Index file.
# Uncomment this line if you are going to run the Tilestache Tileserver
# instance locally.
#TILESTACHE_INDEX = 'http://localhost/tiles/'

# Here we define the Docker URI of our Tilestache Server Index file
# Uncomment this line if you are going to run the Tilestache Tileserver
# instance in Docker.

TILESTACHE_INDEX = 'http://nginx-webserver/tiles/'


# Here we define the Local URI of our World Port Index database.
# Uncomment this line if you are going to run the PostgreSQL instance locally.
#WPI_HOST = "localhost"

# Here we define the Docker URI of our World Port Index database.
# Uncomment this line if you are going to run the PostgreSQL instance in Docker.
WPI_HOST = "postgresql-datastore"

WPI_DATABASE = "World_Port_Index_Database"
WPI_USER = "postgres"
WPI_PASS = "geostack"
