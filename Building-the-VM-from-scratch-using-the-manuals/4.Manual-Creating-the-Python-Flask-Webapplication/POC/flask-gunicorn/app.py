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

'''
The PyMongo module is used to create MongoDB queries and connections to
our MongoDB databases.
'''
from flask_pymongo import PyMongo

'''
The psycopg2 package is used to create PostgreSQL queries and connections
to our PostgreSQL databases
'''
import psycopg2

'''
The ObjectId module is used to transform an Id passed by the Angular application
to a valid MongoDB id.
The json_util module is used to convert the BSON, which is returned by MongoDB,
into a valid JSON format
'''
from bson.objectid import ObjectId
from bson import json_util

'''
The pandas and pandas_profiling packages are used to create data profiles of
the datasets in our MongoDB datastore
'''
import pandas as pd
import pandas_profiling


'''
The urlopen and BeautifulSoup modules are used to parse the HTML page,
which contains our all tilestache configuration entries, from the NGINX Webserver.
The datetime module is used to convert datetime strings to a valid datetime format.
'''
from urllib.request import urlopen
from bs4 import BeautifulSoup
from datetime import datetime
import json

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 1) Create a WSGI webserver application with the script file name (__name__).
#    Note: passing __name__ as a parameter makes it possible for the app object
#          to determine if this script was started as an application or if it
#          was imported as a module.
#          For the same reason the application part of the script is started
#          with a "if __name__ == '__main__':" statement but now for Flask with
#          the app.run() function instead of the usual main() function.
app = Flask(__name__) # app is now an instance of the Flask class (= WSGI app!).

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 2) Assign the configuration file to our Flask application instance
'''
In the line below, the flask configuration file, called: "config.py", is assigned to
our Flask instance. This configuration file contains our database connectionstrings.
'''
app.config.from_pyfile('config.py')

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#               CODE BELOW IS RELATED TO OUR MONGDB DATASTORES                #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 3) Connect to the Crane Database
crane_connection= PyMongo(app, uri=app.config["CRANE_DATABASE_URI"])

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                      QUERIES RELATED TO CRANE DATA                          #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 4) Create the function wich is triggerd when navigating to localhost:5000
@app.route('/') # Define the URL to bind to the function!
def index():
    # This is the associated function that runs when an URL is received
    # Define message texts and pass these as a parameter to render_template().
    # render_template() looks in the app/templates folder for index.html!
    # The HTML file uses a CSS file style.css that is in the /static/css folder.
    message_title =    '--> Welcome to a secure web application! <--'
    message_subtitle = '--- Running on a NGINX Web server---'
    return render_template('index.html',\
                           message_title=message_title,\
                           message_subtitle=message_subtitle)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 5) Create the function which retrieves all the trackers stored in our
#    Crane database
@app.route('/api/trackers/', methods=['GET'])
def get_all_trackers():

    # Assign the results of the query to a variable called: "query_results"
    query_result = crane_connection.db.tracker.find()

    # Return the data obtained by the query in a valid JSON format
    return json.dumps(list(query_result), default=json_util.default)


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 6) Create the function which retrieves a tracker by using it MongoID
@app.route('/api/trackers/<id>', methods=['GET'])
def get_one_tracker(id):

    # Assign the results of the query to a variable called: "query_results"
    query_result = crane_connection.db.tracker.find({"_id": ObjectId(id)})

    # Return the data obtained by the query in a valid JSON format
    return json.dumps(query_result, default=json_util.default)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 7) Create the function which returns the total amount of transmissions
#     in the database
@app.route('/api/transmissions_count/', methods=['GET'])
def get_all_transmissions_count():

    # The query is performed on the transmission collection
    # .count() is used to count all documents in the MongoDB
    # datastore
    query_result = crane_connection.db.transmission.count()

    # Transform the result in a string
    return str(query_result)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 8) Create the function which returns all the transmission belonging to a
#     certain tracker
@app.route('/api/transmissions_by_id/<id>', methods=['GET'])
def get_all_transmissions_by_id(id):

    # The query is performed on the transmission collection
    # the value of the tracker ReferenceField is compared to the
    # id passed in the function. the [:100] is used to only return
    # the first 100 results.
    query_result = crane_connection.db.transmission.find(
        {"tracker": ObjectId(id)})[:100]

    # Convert the results to a list and dump the result
    return json.dumps(list(query_result), default=json_util.default)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 9) Create the function which returns a given amount of transmissions from
#     a certain tracker
@app.route('/api/transmissions_by_amount/<id>/<amount>', methods=['GET'])
def get_all_transmissions_amount(id,amount):

    # The query is performed on the transmission collection
    # the value of the tracker ReferenceField is compared to the
    # id passed in the function. the int([:amount]) is used to only return
    # the the amount passed in the function.
    query_result = crane_connection.db.transmission.find(
        {"tracker": ObjectId(id)})[:int(amount)]


    # Convert the results to a list and dump the result
    return json.dumps(list(query_result), default=json_util.default)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 10) Create the function which retrieves all transmissions
#     between a given DTG (Date time group).
@app.route('/api/transmissions_by_dtg/<id>/<dtg_1>/<dtg_2>', methods=['GET'])
def get_all_transmissions_dtg(id,dtg_1,dtg_2):

    # Since the dtg's passed by the angular applications are invalid and
    # have the format: 2020-01-21, we need to strip the values and create
    # a valid datetime. This is what happends in the lines below.
    dtg_1= datetime.strptime(str(dtg_1), '%Y-%m-%d')
    dtg_2= datetime.strptime(str(dtg_2), '%Y-%m-%d')


    # In the query, shown in the illustration below ,
    # we search on the field: “timestamp". Then we use: “$gt”, to define that
    # we want all the transmissions after the value of dtg_1. Then we use: “$lt”,
    # to define that we want all the transmissions below the value of dtg_2.
    # Again, we also search on the ReferenceField: "tracker".
    query_result = crane_connection.db.transmission.find(
        {"timestamp": { "$gt": dtg_1, "$lt": dtg_2},"tracker":ObjectId(id)})

    # Convert the results to a list and dump the result
    return json.dumps(list(query_result), default=json_util.default)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 11) Create the function which retrieves all transmissions
#     in a given polygon.
@app.route('/api/transmissions_in_polygon/<id>/<coords>', methods=['GET'])
def get_all_transmissions_in_polygon(id,coords):

    # Since the coordinates, passed by our Angular application, are passed
    # as one string, the string needs to be transformed into a list of valid
    # coordinate pairs.

    # This line splits, the string at each: “,”. Then it appends the
    # remaining values to a variable called: “splitted_coords”.
    splitted_coords= coords.split(',')

    # Here we loop trough each value in the list and convert the values to floats.
    float_coords = [float(i) for i in splitted_coords]

    # This line alternately appends coordinates to a set of 2 coordinates
    final_coords = [float_coords[k:k+2] for k in range(0, len(float_coords), 2)]

    # Below, a query is created wich searches for all transmissions in a polygon
    # defines by the coordinates passed by our angular application.
    query_result = crane_connection.db.transmission.find(
        {
        "geometry.coord":{
            "$geoWithin":{
                "$geometry":{
                    "type":"Polygon",
                    "coordinates":[final_coords],
                    "crs":{
                    "type":"name",
                    "properties":{
                        "name":"urn:x-mongodb:crs:strictwinding:EPSG:4326"
                        }
                    }
                }
            }
        },
        "tracker":ObjectId(id)
        })

    # Convert the results to a list and dump the result
    return json.dumps(list(query_result), default=json_util.default)


# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                          PANDAS PROFILING RELATED                           #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 12) Create a generic function for creating dataprofiles
#     The function expects the following parameters:
#       - Data from which a Pandas dataframe will be created
#       - A title, which will be displayed at the top of the profiles
#       - A output, which is the location where the profile will be generated
#
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
def create_profile(data,title,output):

    # Transform the Pymongo object to a list and append it to a dataframe
    # Assign the dataframe to a variable called: "df"
    df = pd.DataFrame(list(data))

    # Call the function: “profile_report()”, on the data frame and pass the
    # title, passed in the function:”create_profile()”, as parameter.
    # Then assign the results to a variable called: “profile”.
    profile = df.profile_report(title=title)

    # Export the profile to a .HTML file using the function: “.to_file()”.
    # Pass the output location, passed in the function:”create_profile()”,
    # as parameter in the function: “.to_file()”.
    profile.to_file(output_file=output)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 13) Create a function which creates a dataprofile for the trackers in the
#     MongoDB datastore
@app.route('/api/generate-trackers-profile', methods=['GET'])
def generate_trackers_profile():

    # Retrieve all the trackers in the database (Blue), and make sure the
    # MongoID is not retrieved from the database (Green).
    # We do this because the MongoID isn't seen as a valid variable by
    # Pandas_Profiling.  To skip a certain variable we use the syntax:
    # .find({},{fieldname : 0}, where “fieldname” is the variable you want to skip.
    query_result = crane_connection.db.tracker.find({},{"_id":0})

    # Call the function: “create_profile()” (Orange), and pas the following parameters:
    #  1) The variable: “query_result”, which contains the data returned by the query.
    #
    #  2) “Trackers profile”, which will be the title at the top of the data profile.
    #
    #  3) The location where the tracker profile will be generated. In this case an HTML
    #     file called: “tracker.html”, will be generated in the templates folder.
    create_profile(query_result,"Trackers profile","templates/tracker.html")

    # The function: “generate_profile”, will then return a rendered HTML file containing
    # our tracker data profile.
    return render_template('tracker.html')


# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#            CODE BELOW IS RELATED TO OUR POSTGRESQL DATASTORES               #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 14) Create a generic function which performs queries on a PostgreSQL datastore
#
#     The function expects the following paramaters:
#     1) The name of the database
#        Ex.: World_Port_Index
#     2) The host on which the database is running
#        Ex.: localhost
#     3) The user that owns the database
#        Ex.: postgres
#     4) The password for the database
#        Ex.: postgres
#     5) The query which you want to execute on the database.
#        Ex.: "SELECT COUNT(*) FROM wpi;"
#
#     The parameters 1 till 4, should come from the config.py file.
#
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

def query_pgsql(_database, _host, _user, _password, query):

    # Use an try/except statement which will print: "failed to connect",
    # if the connection failed.
    try:
        # Connect to the PostgreSQL database using the values passed
        # in the function: "query_psql"
        conn = psycopg2.connect(database=_database,
                                    host=_host,
                                    user=_user,
                                    password=_password)

        # Assing the connection cursor to a variable called: "curs".
        curs = conn.cursor()

        # Execute the query passed in the function.
        curs.execute(query)

        # Fetch all the results and assign them to a variable called: "res".
        res = curs.fetchall()

        # Close the connection.
        conn.close()

        # Return all the results.
        return res

    except:

        # Print failed to connect if connection failed
        print("Failed to connect to:" + _database)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 15) Create the function which retrieve the amount of Ports in the
#     PostgreSQL database.
@app.route('/api/ports_count/', methods=['GET'])
def get_all_ports_count():

    # Create the query to execute
    query = "SELECT COUNT(*) FROM wpi;"

    # Call the function: "query_pgsql()" and pass the connection
    # paramaters of the WPI database. Also pass the query defined
    # above.
    query_result = query_pgsql(app.config["WPI_DATABASE"],
                               app.config["WPI_HOST"],
                               app.config["WPI_USER"],
                               app.config["WPI_PASS"],
                               query)

    # Return the results as valid JSON.
    return json.dumps(query_result)


# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 16) Create the function which retrieves information on all the Ports
#     in the PostgreSQL database.
@app.route('/api/ports/', methods=['GET'])
def get_all_ports():

    # Create the query to execute
    query = "SELECT longitude, latitude, PORT_NAME, COUNTRY FROM wpi;"


    # Call the function: "query_pgsql()" and pass the connection
    # paramaters of the WPI database. Also pass the query defined
    # above.
    query_result = query_pgsql(app.config["WPI_DATABASE"],
                               app.config["WPI_HOST"],
                               app.config["WPI_USER"],
                               app.config["WPI_PASS"],
                               query)
    # Return the results as valid JSON.
    return json.dumps(query_result)


# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                       TILESTACHE TILESERVER RELATED                         #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 17) Create a function which returns the names of all the tilestache entries.
#    This function is neccesary to be able to switch between webmapserver.
#    The following applies to the code below:
#        • The route which is bound to the function is:
#          “ http://localhost/api/get_all_tilestache_entries/”
#        • The name of the function is: “get_all_tilestache_entries()”
#        • This function scrapes all the <p> tags from the HTML file located
#           at: “http:localhost/tiles/”
#
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
@app.route('/api/get_tilestache_entries/')
def get_all_tilestache_entries():

    # Scrape the HTML page located at: "http://localhost/tiles/"
    scraped_entries = BeautifulSoup(
        urlopen(app.config["TILESTACHE_INDEX"]),features="html.parser")

    # Create an empty list called: "entries"
    entries = []

    # Loop trough all the HTML elements on the page.
    # Execute the code in the FOR loop if the HTML elememt tag
    # matches 'p'.
    for tag in scraped_entries.find_all('p'):

        # If an HTML elements matches with the <p> tag, the content
        # of the <p> tag will be encoded en decoded. Then we append
        # it to the list of entries.
        entries.append(tag.text.encode('utf-8').decode('utf-8'))

    # Return the entries in JSON format
    return json.dumps(entries, default=json_util.default)


# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                                                                             #
#                      QUERIES RELATED TO TRAIL DATA                          #
#                                                                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# The following code is not described in the programming manual for creating
# the Python Flask web application.
#
# The code below basiclly does the same as the code above but then for the
# GPS-Route (Trail) datasets.
# This code should be used if you also want to visualze the GPS-Route datasets.
# Connect to the Trial Database
trail_connection = PyMongo(app, uri=app.config["TRAIL_DATABASE_URI"])

@app.route('/api/trails/', methods=['GET'])
def get_all_trails():

    query_result = list(trail_connection.db.trail.find())

    return json.dumps(query_result, default=json_util.default)

@app.route('/api/trails/<id>', methods=['GET'])
def get_one_trail(id):

    query_result = trail_connection.db.trail.find({"_id": ObjectId(id)})

    return json.dumps(query_result, default=json_util.default)

@app.route('/api/signals_count/', methods=['GET'])
def get_all_signals_count():

    query_result = str(trail_connection.db.signal.count())

    return query_result

@app.route('/api/signals_by_id/<id>', methods=['GET'])
def get_all_signals_by_id(id):

    query_result = list(trail_connection.db.signal.find({"trail": ObjectId(id)})[:2000])

    return json.dumps(query_result, default=json_util.default)

@app.route('/api/signals_by_amount/<id>/<amount>', methods=['GET'])
def get_all_signals_amount(id,amount):

    query_result = list(trail_connection.db.signal.find(
        {"trail": ObjectId(id)})[:int(amount)]
    )

    return json.dumps(query_result, default=json_util.default)


@app.route('/api/signals_by_dtg/<id>/<dtg_1>/<dtg_2>', methods=['GET'])
def get_all_signals_dtg(id,dtg_1,dtg_2):

    dtg_1= datetime.strptime(str(dtg_1), '%Y-%m-%d')
    dtg_2= datetime.strptime(str(dtg_2), '%Y-%m-%d')

    query_result = list(trail_connection.db.signal.find(
        {"time": { "$gt": dtg_1, "$lt": dtg_2},"trail":ObjectId(id)})
    )

    return json.dumps(query_result, default=json_util.default)


if __name__ == '__main__':
    # Call the trigger function app.run() to run the Flask application webserver.
    app.run(host='0.0.0.0') # Run the Flask WSGI app in the normal operation mode!
    #app.run(debug=True) # Run the Flask WSGI app in debugging mode!
