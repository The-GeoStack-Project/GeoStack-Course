#!/bin/sh

echo "-------------->>>> Installing NGINX <<<<--------------"
sleep 2

# Download and add the NGINX signing key.
wget -qO - wget http://nginx.org/keys/nginx_signing.key | sudo apt-key add -

# Add the NGINX repo's to the systems repository list.
echo 'deb [arch=amd64] http://nginx.org/packages/mainline/ubuntu/ bionic nginx' | sudo tee --append /etc/apt/sources.list.d/nginx.list
echo 'deb-src http://nginx.org/packages/mainline/ubuntu/ bionic nginx'| sudo tee --append /etc/apt/sources.list.d/nginx.list

# Update the local package database.
sudo apt update

# Remove any old versions of NGINX if there are any.
sudo apt remove nginx nginx-common nginx-full nginx-core

# Install NGINX.
sudo apt install nginx

# Install the packages required for installing ModSecurity.
sudo apt-get install -y apt-utils autoconf automake build-essential git libcurl4-openssl-dev libgeoip-dev liblmdb-dev libpcre++-dev libtool libxml2-dev libyajl-dev pkgconf zlib1g-dev

echo "-------------->>>> Copying nginx root script <<<<--------------"
sleep 2
# Copy the ModSecurity install script to the correct location on the system.
sudo cp ~/Installation-scripts/root-scripts/nginx-root-commands.sh /opt

echo "-------------->>>> Changing permissions nginx root script <<<<--------------"
sleep 2
# Set the permissions of the ModSecurity install script.
sudo chmod +x /opt/nginx-root-commands.sh

echo "-------------->>>> Executing nginx root script <<<<--------------"
sleep 2
# Run the ModSecurity install script using the root user.
su -c /opt/nginx-root-commands.sh root

echo "-------------->>>> Installing ModSecurity CRS<<<<--------------"
sleep 2

# Create a new directory in the NGINX directory.
sudo mkdir /etc/nginx/modsec

# Enter the modsec directory and clone the CRS github repo.
cd /etc/nginx/modsec && sudo git clone https://github.com/SpiderLabs/owasp-modsecurity-crs.git

# Copy the modsec unicode.mapping to the nginx/modsec folder.
sudo cp /opt/ModSecurity/unicode.mapping /etc/nginx/modsec/unicode.mapping

# Copy and rename the example CRS config to the correct folder.
sudo cp /etc/nginx/modsec/owasp-modsecurity-crs/crs-setup.conf.example /etc/nginx/modsec/owasp-modsecurity-crs/crs-setup.conf

# Copy and rename the recommended modsec settings to the correct folder.
sudo cp /opt/ModSecurity/modsecurity.conf-recommended /etc/nginx/modsec/modsecurity.conf

# Set the ModSecurity detection settings to on. This will not only log attacks but also block them.
sudo sed -i 's/SecRuleEngine DetectionOnly/SecRuleEngine On/' /etc/nginx/modsec/modsecurity.conf

# Create the modsec config file.
sudo touch /etc/nginx/modsec/main.conf

# Add the ModSec related settings to this main config file.
sudo tee -a /etc/nginx/modsec/main.conf > /dev/null <<EOT
Include /etc/nginx/modsec/modsecurity.conf
Include /etc/nginx/modsec/owasp-modsecurity-crs/crs-setup.conf
Include /etc/nginx/modsec/owasp-modsecurity-crs/rules/*.conf
EOT

# Copy the nginx configuration located in the Geostack folder to the correct
# location on the system.
sudo cp ~/Geostack/nginx-modsecurity/nginx-local.conf /etc/nginx/nginx.conf


echo "-------------->>>> Restarting NGINX <<<<--------------"
# Restart NGINX for the changes to take effect.
sudo service nginx restart

echo "-------------->>>> DONE <<<<--------------"

sleep 2
