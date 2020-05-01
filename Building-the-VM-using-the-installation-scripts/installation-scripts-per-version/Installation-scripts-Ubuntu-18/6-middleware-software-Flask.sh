#!/bin/sh
echo "-------------->>>> Installing Gunicorn 3 <<<<--------------"
sleep 2
# Install gunicorn 3
sudo apt install gunicorn3

echo "-------------->>>> Installing Flask <<<<--------------"
sleep 2
# Install Flask using python pip 3
pip3 install Flask

echo "-------------->>>> Installing BeautifullSoup <<<<--------------"
sleep 2
# Install BeautifullSoup 4.
pip3 install bs4

echo "-------------->>>> Installing Flask-Pymongo <<<<--------------"
sleep 2
# Install Flask-pymongo using python pip 3
pip3 install flask-pymongo

echo "-------------->>>> Installing PsycoPG2 <<<<--------------"
sleep 2

# Install the packages required for psycopg2.
sudo apt-get install libpcap-dev libpq-dev

# Install psycopg2.
pip3 install psycopg2

echo "-------------->>>> DONE <<<<--------------"
