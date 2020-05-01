#!/bin/sh
echo "-------------->>>> Adding Modsecurity Modules <<<<--------------"

# Enter the directory opt, clone the ModSecurity github repo and enter the ModSecurity directory.
cd /opt/ && sudo git clone https://github.com/SpiderLabs/ModSecurity && cd ModSecurity

# checkout the github master branch.
sudo git checkout v3/master

# Instantiate the github submodules.
sudo git submodule init

# Update the github submodules.
sudo git submodule update

# Run the ModSec build script.
sh build.sh

# Configure the ModSec build script.
./configure

# Compile the ModSecurity modules.
make

# Install the Modsecurity modules.
make install

# Enter the opt directory and clone the NGINX ModSecurity connector repo.
cd /opt/ && git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git

# Run the command nginx-v to obtain the current NGINX version and assign it
# to a variable called: "nginxv".
command="nginx -v"
nginxv=$( ${command} 2>&1 )

# Only grep the version number and append it to a text file.
echo $nginxv | grep -o '[0-9.]*' > version.txt

# Output the version number and assign it to a variable called version.
version=$( cat version.txt )

# Download the NGINX modules of the NGINX version obtained in the previous steps.
wget http://nginx.org/download/nginx-$version.tar.gz

# Unzip the downloaded zip file and enter the file directory.
tar zxvf nginx-$version.tar.gz && cd nginx-$version

# Configure the NGINX ModSecurity connector modules.
./configure --with-compat --add-dynamic-module=../ModSecurity-nginx

# Compile the modules
make modules

# Copy the Compiled modules to the nginx modules folder.
sudo cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/

# Logout the root user.
exit
