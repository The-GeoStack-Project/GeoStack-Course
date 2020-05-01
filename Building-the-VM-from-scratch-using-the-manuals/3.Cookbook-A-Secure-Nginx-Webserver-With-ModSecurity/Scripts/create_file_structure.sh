#!/bin/bash
# Bash script for creating folder structure of Secure NGINX Web server
# This script is used in the Cookbook recipe
# "A secure NGINX webserver with modsecurity"
#------------------------------------------------------------------------------
#0) Set variables

#dir variable represents the main directory
dir=`date +%Y%m%d_Secure_Webserver_NGINX`

#Create a new main directory with the current date
mkdir $dir

#------------------------------------------------------------------------------
#1) Create the docker-compose.yml
#This file is used
touch $dir/docker-compose.yml

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# #                                                                         # # 
# #                     Flask-Gunicorn  PART STARTS HERE                    # # 
# #                                                                         # # 
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#------------------------------------------------------------------------------
#2) Create the flask-gunicorn directories.
mkdir $dir/flask-gunicorn
mkdir $dir/flask-gunicorn/templates
mkdir $dir/flask-gunicorn/downloads
mkdir $dir/flask-gunicorn/static
mkdir $dir/flask-gunicorn/static/css
mkdir $dir/flask-gunicorn/static/img

#------------------------------------------------------------------------------
#3) Create the flask-gunicorn files.
touch $dir/flask-gunicorn/app.py
touch $dir/flask-gunicorn/Dockerfile
touch $dir/flask-gunicorn/requirements.txt 
touch $dir/flask-gunicorn/templates/index.html
touch $dir/flask-gunicorn/static/css/style.css
touch $dir/flask-gunicorn/static/img/favicon.ico


# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# #                                                                         # # 
# #                  NGINX-Modsecurity  PART STARTS HERE                    # # 
# #                                                                         # # 
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#------------------------------------------------------------------------------
#4) Create the nginx-modsecurity directories.
mkdir $dir/nginx-modsecurity
mkdir $dir/nginx-modsecurity/static

#------------------------------------------------------------------------------
#5) Create the nginx-modsecurity files.
touch $dir/nginx-modsecurity/Dockerfile
touch $dir/nginx-modsecurity/nginx.conf
touch $dir/nginx-modsecurity/static/index.html

#Display the folder structure in the CLI if tree package is installed
#If tree package is not installed print the error
tree || echo "Package tree is not installed, install it using: 'sudo apt install tree'"

# For test purposes 
# Uncomment to test new file structures
#rm -r $dir


