#!/bin/sh
echo "-------------->>>> Installing Gunicorn 3 <<<<--------------"
sleep 2
# Install gunicorn 3
if [ `lsb_release -cs` == "focal" ] || [ `lsb_release -cs` == "Eoan" ]
then
    sudo apt install gunicorn

else
    sudo apt install gunicorn3
fi

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

echo "-------------->>>> DONE <<<<--------------"
