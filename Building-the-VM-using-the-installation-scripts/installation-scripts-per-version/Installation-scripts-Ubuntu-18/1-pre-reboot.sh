#!/bin/sh

echo "-------------->>>> Updating System <<<<--------------"
sleep 2
# Update the local package database and install the new updates.
sudo apt update && sudo apt upgrade

echo "-------------->>>> Change the default root password <<<<--------------"
echo "-------------->>>> enter the password geostack<<<<--------------"
sleep 2

# Change the default root password.
sudo passwd root

echo "-------------->>>> Installing VM tools<<<<--------------"
sleep 2

# Install OpenVMTools for VMware
sudo apt install open-vm-tools-desktop

echo "-------------->>>> Hiding unused desktop shortcuts <<<<--------------"
sleep 2
# Hide the trash icon from the desktop
# Show the mounted volumes on the desktop
gsettings set org.gnome.nautilus.desktop trash-icon-visible true
gsettings set org.gnome.nautilus.desktop volumes-visible true

echo "-------------->>>> Installing Bleachbit <<<<--------------"
sleep 2
# Install bleachbit
sudo apt install bleachbit

echo "-------------->>>> Installing Libreoffice Writer <<<<--------------"
sleep 2
# Install Libreoffice writer
sudo apt install libreoffice-writer

echo "-------------->>>> Installing CURL <<<<--------------"
sleep 2
# Install Curl
sudo apt install curl

echo "-------------->>>> Installing Net tools <<<<--------------"
sleep 2
# Install net-tools
sudo apt install net-tools

echo "-------------->>>> Installing Python and PIP <<<<--------------"
sleep 2

# Install Python3 and Python3-Pip
sudo apt install python3-pip

# Install Python and Python-Pip
sudo apt install python-pip

echo "-------------->>>> Installing GIT <<<<--------------"
sleep 2

# Install GIT
sudo apt install git

echo "-------------->>>> Installing Atom <<<<--------------"
sleep 2 

# There are multiple ways to install atom. These methods can be found on the following URL's:
# https://flight-manual.atom.io/getting-started/sections/installing-atom/
# https://itsfoss.com/install-atom-ubuntu/
# 
# Add the atom signing key.
wget -qO - https://packagecloud.io/AtomEditor/atom/gpgkey | sudo apt-key add -

# Add the atom repo to the repo list.
sudo sh -c 'echo "deb [arch=amd64] https://packagecloud.io/AtomEditor/atom/any/ any main" > /etc/apt/sources.list.d/atom.list'

# Update the local package database and install Atom.
sudo apt-get update && sudo apt-get install atom

echo "-------------->>>> Adding new shortcuts <<<<--------------"
sleep 2
# Add new shortcuts to favorite sidebar
gsettings set org.gnome.shell favorite-apps "['firefox.desktop', 'org.gnome.Nautilus.desktop','org.gnome.Terminal.desktop', 'libreoffice-writer.desktop','atom.desktop','yelp.desktop', 'org.gnome.Software.desktop']"

echo "-------------->>>> Installing Docker <<<<--------------"
sleep 2
# Update local package database
sudo apt-get update

# Install required packages for Docker.
sudo apt-get install apt-transport-https ca-certificates curl software-properties-common

# Download the docker GPG key and add it to the key database
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add

# Add the official Docker repo to the systems repository list.
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu
$(lsb_release -cs) stable"

# Update local package database
sudo apt-get update

# Install Docker
sudo apt-get install docker-ce

echo "-------------->>>> Installing Docker-Compose <<<<--------------"
sleep 2

# Enter the directory /usr/local/bin and download the Docker-compose script.
cd /usr/local/bin && sudo curl -L "https://github.com/docker/compose/releases/download/1.25.0-rc2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Set the permissions of the Docker-compose script to executable.
sudo chmod +x /usr/local/bin/docker-compose

# Add the current user to the docker user list.
sudo usermod -a -G docker $USER

echo "-------------->>>> Installing NodeJS <<<<--------------"
sleep 2

# Run the NodeJS setup script located in the root-scripts folder.
sudo bash ~/Installation-scripts/root-scripts/nodesource_setup.sh

# Install the package required for nodejs.
sudo apt install build-essential

# Install nodejs.
sudo apt install nodejs

echo "-------------->>>> Rebooting system <<<<--------------"
sleep 5

# Reboot the system.
reboot

