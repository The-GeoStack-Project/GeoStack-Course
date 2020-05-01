# Get the base image with the OS and Python from DockerHub
FROM python:3.7.2

# Create the image webserver folder including the parent folders
# project and home because they do not exist yet by using -p.
RUN mkdir -p /home/project/flask_app

# Set the new folder as the default working directory
WORKDIR /home/project/flask_app

# Copy the Python requirements.txt file into the webserver folder.
# This config file defines the gunicorn and flask modules to be installed.
COPY requirements.txt /home/project/flask_app
# Run the requirements.txt file with pip to install gunicorn and flask.
RUN pip install --no-cache-dir -r requirements.txt

# Finally copy the gunicorn-flask folder into the image webserver folder.
# This copies the subfolders and the flask webserver WSGI app file app.py
COPY . /home/project/flask_app

# Copy the Flask docker configuration as config.py
COPY ./config-docker.py /home/project/flask_app/config.py

# Run de flask app app.py on the gunicorn WSGI webserver on port 8000.
CMD ["gunicorn"  , "-b", "0.0.0.0:8000", "app:app"]
#RUN gunicorn -b 0.0.0.0:8000 app:app
