#!/bin/sh
echo "-------------->>>> Moving GeoStack shortcuts <<<<--------------"
sleep 2
# A for loop which loops through the content of the Shortcuts folder. and then
# copies each file to the Desktop.
for i in ~/Geostack/startup-shortcuts/*.desktop; do cp $i ~/Desktop/ ;done

echo "-------------->>>> Setting shortcuts to trusted <<<<--------------"
sleep 2
# A for loop which loops through all the shortcuts on the desktop and then
# sets the shortcut metadata to trusted. This has to be done for the Shortcuts
# to be executable.
for i in ~/Desktop/*.desktop; do    gio set "$i" "metadata::trusted" yes ;done

echo "-------------->>>> Restarting nautilus <<<<--------------"
sleep 2
# Kill the nautilus process for the changes in the previous step to take effect.
pkill nautilus

# Restart the nautilus process in the background. This is done by using the
# syntax : "> /dev/null 2>&1 &"
nautilus-desktop > /dev/null 2>&1 & echo "-------------->>>> Restarted nautilus <<<<--------------"


echo "-------------->>>> Creating file links <<<<--------------"
sleep 2
# Create file links on the desktop for each of the folders in Geostack folder.
ln -s /home/geostack/Geostack/jupyter-notebooks ~/Desktop/7.jupyter-notebooks
ln -s /home/geostack/Geostack/mongodb-datastore ~/Desktop/6.mongodb-datastore
ln -s /home/geostack/Geostack/postgresql-datastore ~/Desktop/5.postgresql-datastore
ln -s /home/geostack/Geostack/tilestache-server ~/Desktop/4.tilestache-server
ln -s /home/geostack/Geostack/flask-gunicorn ~/Desktop/3.flask-gunicorn
ln -s /home/geostack/Geostack/nginx-modsecurity ~/Desktop/2.nginx-modsecurity
ln -s /home/geostack/Geostack/angular-apps ~/Desktop/1.angular-apps
ln -s /home/geostack/Geostack/import-utilities ~/Desktop/import-utilities
ln -s /home/geostack/Geostack/cesium-server ~/Desktop/cesium-server

echo "-------------->>>> DONE <<<<--------------"
#sleep 2
# Remove the startup-shortcuts folder from the Geostack folder.
#rm -r ~/Geostack/startup-shortcuts
