#!/bin/sh

echo "-------------->>>> Installing PostgreSQL <<<<--------------"
sleep 2

# Download the PostgreSQL signing key and add it to the key database.
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Add the PostgreSQL repo to the systems repository list.
sudo sh -c 'echo "deb [arch=amd64] http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'
# Update the local package database.
sudo apt update

# Install PostgreSQL depending on the Ubuntu version.
if [ `lsb_release -cs` == "focal" ] || [ `lsb_release -cs` == "Eoan" ]
then
    sudo apt install postgresql-12
else
    sudo apt install postgresql-11
fi


echo "-------------->>>> Installing PostGIS <<<<--------------"
sleep 2
# Install PostGIS depending on Ubuntu version.
if [ `lsb_release -cs` == "focal" ] || [ `lsb_release -cs` == "Eoan" ]
then
    sudo apt install postgis postgresql-12-postgis-2.5
else
    sudo apt install postgis postgresql-11-postgis-2.5
fi


echo "-------------->>>> Changing The default PostgreSQL password <<<<--------------"
echo "-------------->>>> enter the password geostack<<<<--------------"
# Login to the postgres user to set the default password.
sudo -u postgres psql <<EOF
\password postgres
\q
EOF
echo "-------------->>>> Changed <<<<--------------"

echo "-------------->>>> Installing PGMyAdmin <<<<--------------"
sleep 2
# Install PGMyAdmin4 depending on the Ubuntu version
sudo apt install pgadmin4

echo "-------------->>>> Installing PsycoPG2 <<<<--------------"
sleep 2

# Install the packages required for psycopg2.
sudo apt-get install libpcap-dev libpq-dev python-dev python3-dev 

# Install psycopg2.
pip3 install psycopg2

echo "-------------->>>> Installing MongoDB <<<<--------------"
sleep 2
# Install a package required for MongoDB
sudo apt install libgconf-2-4

# Install MongoDB
sudo apt install mongodb

echo "-------------->>>> Downloading MongoCompass <<<<--------------"
sleep 2
# Download the MongoCompass deb file.
wget https://downloads.mongodb.com/compass/mongodb-compass_1.20.4_amd64.deb

echo "-------------->>>> Installing MongoCompass <<<<--------------"
sleep 2
# Run dpkg to install the deb file downloaded in the previous step.
sudo dpkg -i mongodb-compass_1.20.4_amd64.deb

echo "-------------->>>> Adding shortcut <<<<--------------"
sleep 2
# Set the sidebar shortcuts to contain firefox, nautilus, a terminal launcher, atom and the MongoCompass shortcut.
gsettings set org.gnome.shell favorite-apps "['firefox.desktop', 'org.gnome.Nautilus.desktop', 'org.gnome.Terminal.desktop', 'libreoffice-writer.desktop', 'atom.desktop', 'mongodb-compass.desktop', 'pgadmin4.desktop','yelp.desktop', 'org.gnome.Software.desktop']"

echo "-------------->>>> Installing MongoEngine <<<<--------------"
sleep 2

# Install MongoEngine
pip3 install mongoengine


echo "-------------->>>> Cleaning <<<<--------------"
sleep 2

# Remove the downloaded deb file from MongoCompass.
sudo rm mongodb-compass_1.20.4_amd64.deb

echo "-------------->>>> DONE <<<<--------------"
