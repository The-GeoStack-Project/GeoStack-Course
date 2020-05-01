"""
Script : Flask Micro Webserver
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Goal   : Creating a secure webserver using NGINX, ModSecurity, Flask and Gunicorn
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Date   : 20191016
Version: 0.0.4
Last Changes:
1) 
2) 
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
"""

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 0) Import the required modules or functions from modules.
from flask import Flask, render_template
# Flask is used to create a WSGI application object called 'app'
# render_template is used to serve static HTML files from the templates folder.

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 1) Create a WSGI webserver application with the script file name (__name__).
#    Note: passing __name__ as a parameter makes it possible for the app object
#          to determine if this script was started as an application or if it
#          was imported as a module.
#          For the same reason the application part of the script is started
#          with a "if __name__ == '__main__':" statement but now for Flask with
#          the app.run() function instead of the usual main() function.
app = Flask(__name__) # app is now an instance of the Flask class (= WSGI app!).


@app.route('/') # Define the URL to bind to the function!
def index():
    # This is the associated function that runs when an URL is received
    # Define message texts and pass these as a parameter to render_template().
    # render_template() looks in the app/templates folder for index.html!
    # The HTML file uses a CSS file style.css that is in the /static/css folder.
    message_title =    '--> Welcome to a secure web application! <--'
    message_subtitle = '---Running on a NGINX Web server---'
    return render_template('index.html',\
                           message_title=message_title,\
                           message_subtitle=message_subtitle)

if __name__ == '__main__':
    # Call the trigger function app.run() to run the Flask application webserver.
    app.run(host='0.0.0.0') # Run the Flask WSGI app in the normal operation mode!
    #app.run(debug=True) # Run the Flask WSGI app in debugging mode!