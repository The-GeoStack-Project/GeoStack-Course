#!/bin/sh
echo "-------------->>>> Installing Angular-CLI <<<<--------------"
sleep 2

# Install the Angular CLI.
sudo npm install -g @angular/cli

echo "-------------->>>> Setting access to the local update config  <<<<--------------"
sleep 2
# Add access to NPM config for the user geostack.
#sudo chown -R $USER:$(id -gn $USER) /home/geostack/.config 

echo "-------------->>>> Installing Dataset Dashboard <<<<--------------"
sleep 2

# Enter the dataset dashboard directory and install the node modules.
cd ~/Geostack/angular-apps/dataset-dashboard && sudo npm install

echo "-------------->>>> Installing 2D Map Viewer <<<<--------------"
sleep 2

# Enter the 2D Map Viewer directory, install the node_modules and update the node_modules.
cd ~/Geostack/angular-apps/2d-map-viewer && sudo npm install

echo "-------------->>>> Installing 3D Map Viewer <<<<--------------"
sleep 2
# Enter the 3D Map Viewer directory, install the node_modules and update the node_modules.
cd ~/Geostack/angular-apps/3d-map-viewer && sudo npm install
