

#--------------------------------------------------------------------------
# 1) Get this base image with the OS and the nginx webserver from DockerHub.
# Original OWASP image with SETPROXY=True
FROM owasp/modsecurity:3.0-nginx

#--------------------------------------------------------------------------
# 2) Set arguments

#Set repository argument.
#This is the official OWASP CRS Github repository.
ARG REPO=SpiderLabs/owasp-modsecurity-crs

#Set repo branch argument.
#The branch that will be fetched and used
ARG BRANCH=v3.3/dev

#Set branch commit argument.
#The commit version that will be downloaded and used
ARG COMMIT=v3.3/dev

#--------------------------------------------------------------------------
# 3) Clone the CRS
# The core ruleset is downloaded, cloned, and copied to the modsecurity
# configuration file.

# Update the package index
RUN apt-get update && \ 

  # Install required libraries
  apt-get -y install python git ca-certificates iproute2 && \

  # Create the directory in which the repo will be cloned
  mkdir /opt/owasp-modsecurity-crs-3.2 && \

  # Navigate to that directory
  cd /opt/owasp-modsecurity-crs-3.2 && \ 

  # Initialize a github repository
  git init && \ 
  
  # Add the Modsecurity Core Rule Set repository.
  # The repository was set in step 2.
  git remote add origin https://github.com/${REPO} && \ 

  # Fetch the branch set in step 2
  git fetch --depth 1 origin ${BRANCH} && \ 

  # Dowload the commit version. 
  # This argument was set in step 2.
  git checkout ${COMMIT} &&\

  # Copy the contents of the example configuration
  # file to the actual config file.
  mv crs-setup.conf.example crs-setup.conf && \

  # Create a link between owasp-modsecurity-crs-3.2  and owasp-crs file.
  ln -sv /opt/owasp-modsecurity-crs-3.2 \
  /etc/modsecurity.d/owasp-crs && \
  
  # Copy the rulset from the cloned github repository to the 
  # modsecurity configuration file
  printf "include /etc/modsecurity.d/owasp-crs/crs-setup.conf\ninclude \
  /etc/modsecurity.d/owasp-crs/rules/*.conf" >> \
  /etc/modsecurity.d/include.conf && \
  
  # Toggle on Modesecurity rule Engine in the modesecurity configuration file. 
  # Change the SecRuleEngine directive in the configuration to change from the
  # default “detection only” mode to actively dropping malicious traffic.
  sed -i -e 's/SecRuleEngine DetectionOnly/SecRuleEngine On/g' \
  /etc/modsecurity.d/modsecurity.conf


#--------------------------------------------------------------------------
# 4) Finalize the installation

# Copy the nginx.conf config file to the image's webserver config folder.
# Uncomment if you want an costum Nginx configuration. 
COPY nginx.conf /etc/nginx
# Copy the local static dataset folder to the webserver folder in the image.
COPY /static /data/Publishers

