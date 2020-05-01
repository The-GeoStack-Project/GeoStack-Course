# Below we import the modules required for this script.
# MongoEngine is used to create the datamodel and load the data according
# to the datamodel.
from mongoengine import *
# datetime is used to convert the Invalid datetimes to a valid format.
from datetime import datetime
# Pandas is used to create dataframe's and check the intergrity of the datasets.
import pandas as pd
# The tkinter module is used to create a GUI.
import tkinter
# The filedialog module is used to show a file selection GUI.
from tkinter import filedialog
# The gpxpy module is used to import GPX datasets
import gpxpy

# Here we create a new instance of a Tkinter GUI.
GUI = tkinter.Tk()
# This line makes sure the GUI is instantiated in the background.
GUI.withdraw()

# Here we create a function called: "csv_import"
def csv_import():

    # Here we add the code logic required to open the selection GUI.
    # The following parameters are passed in this code:
    # - parent = the instance of the Tkinter GUI
    # - mode = specifies if the file shoulde be loaded or selected.
    # - filetypes = specifies the extensions which are allowed to be selected
    #               since the user chose CSV, we are only allowing CSV.
    # - title = the text displayed at the top of the GUI.
    input_file = filedialog.askopenfile(
    parent=GUI,mode='r',filetypes=[('CSV file','*.csv')],title='Choose an CSV file')

    # Here we check if the selected file is not equal to None.
    # If this is the case the following code is executed.
    if input_file != None:

        # Here we read the JSON file using pandas. We assign the dataframe
        # to a variable called: "df".
        df = pd.read_csv(input_file)

        # Here we call the function:"transform_data" in which we pass the
        # dataframe as parameter.
        transform_data(df)

# Here we create a function called: "json_import"
def json_import():

    # Here we add the code logic required to open the selection GUI.
    # Here we pass JSON as the filetypes parameter.
    input_file = filedialog.askopenfile(
    parent=GUI,mode='r',filetypes=[('JSON file','*.json')],title='Choose an JSON file')

    # Here we check if the selected file is not equal to None.
    # If this is the case the following code is executed.
    if input_file != None:

        # Here we read the JSON file using pandas. We assign the dataframe
        # to a variable called: "df".
        df = pd.read_json(input_file)

        # Here we call the function:"transform_data" in which we pass the
        # dataframe as parameter.
        transform_data(df)

# Here we create a function called: "create_dataframe".
# The function takes raw GPX data as input.
def create_dataframe(data):

    # Here we create a new dataframe with the input columns
    # as columns.
    df = pd.DataFrame(columns=['lon', 'lat', 'alt', 'time'])

    # Here we loop through all the points in the list of data
    # which was passed as parameter in this function.
    for point in data:
        # We append the lon,lat,alt and time values to the
        # correct columns in the dataframe which was created earlier.
        df = df.append({'lon': point.longitude,
                        'lat' : point.latitude,
                        'alt' : point.elevation,
                        # Here we convert the datetime to a timestamp.
                        # This is required since we want to remove the timezone
                        # info from the timestamp.
                        'time' : datetime.timestamp(point.time)}, ignore_index=True)

    # Here we return the DataFrame
    return df

# Here we create a function called:"gpx_import".
def gpx_import():

    # Here we add the code logic required to open the selection GUI.
    # Here we pass GPX as the filetypes parameter.
    input_file = filedialog.askopenfile(
    parent=GUI,mode='r',filetypes=[('GPX file','*.gpx')],title='Choose an GPX file')

    # Here we use GPXPY to parse the RAW GPX data.
    # We pass the input_file as parameter.
    parsed_file = gpxpy.parse(input_file)

    # Here we obtain the datapoints of the GPX dataset and assing it to a
    # variable called: "data".
    data = parsed_file.tracks[0].segments[0].points

    # Here we pass the data to the function:"create_dataframe".
    df = create_dataframe(data)

    # Here we pass the newly created dataframe to the transform_data function.
    transform_data(df)

# Here we create a function called: "check_dataframe".
# The function takes a Pandas dataframe as input.
def check_dataframe(df):

    # Here we check if the amount of rows in the dataframe is bigger than 0.
    # We do this by using the syntax: ".shape[0]" on the dataframe.
    # If the dataframe size is bigger than 0 the following code is executed.
    if df.shape[0]>0:

        # Print the amount of rows in the dataframe.
        print("---->>Selected "+ str(df.shape[0])+ " rows.<<----")

        # Print the column names in the dataset.
        print("The dataset has the following columns:")
        print(df.dtypes)
        
        # Return True.
        return True
    # If the dataframe is not bigger than 0, it means the dataframe / dataset
    # is Invalid. If this is the case, the following code is executed.
    else:
        # Print that the dataframe is incorrect.
        print("Dataframe is incorrect, please try again\n")
        # Return False.
        return False

# Here we create a function called: "column_selection".
def column_selection():

    # Here we create an empty list which is going to be populated with the user
    # inputs.
    selected_columns = []

    # Here we ask the user what the names of the ongitude, latitude, altitude
    # and timestamp columns are. We append the user inputs to the selected_columns
    # list.
    selected_columns.append(input('What is the name of the latitude column?\n'))
    selected_columns.append(input('What is the name of the longitude column?\n'))
    selected_columns.append(input('What is the name of the altitude column?\n'))
    selected_columns.append(input('What is the name of the timestamp column?\n'))

    # Finally populated list of selected_columns is returned.
    return selected_columns

# Here we create a function called: "check_columns".
# This function takes a dataframe and a list of selected columns as input.
def check_columns(df,selected_columns):

    # We add a try/execpt to catch any errors if the following code fails after
    # which the function will return false.
    # The following code is always executed.
    try:
        # Here we loop through each column in the selected_columns list.
        for column in selected_columns:
            # Here we check if the column is found in the dataset.
            # If this is the case the code below is executed.
            # If this is not the case (so the column is not found), the function
            # will fail and trigger the except.
            if df[str(column)].shape[0] != 0:
                # Print that the column in found in the dataset.
                print("Found the " + str(column)+ ' column!')
        # Return True if all the columns are found.
        return True
    # The following code is executed if one or more columns are not found.
    except:
        # Return false if a column is not found.
        return False

# Here we create the function:"transform_data"
# This function takes a dataframe as input.
def transform_data(df):
    # Here we check if the input dataframe is valid. If this is the case
    # the function:"check_dataframe" returns true, after which the following
    # code is executed.
    if check_dataframe(df):

        # Here we trigger the function: "column_selection" and assign the
        # selected_columns list to a variable called columns.
        columns = column_selection()

        # Here we check whether the selected_columns are in the dataframe by
        # triggering the function:"check_columns()" in which we pass the
        # dataframe and the selected_columns list. If the columns are found
        # the function:"check_columns" returns true, after witch the following
        # code is executed.
        if check_columns(df,columns):

            # Here we ask the user to choose between 2 options. We assign the
            # result of the user input to a variable called:"type"
            type = input(
            'What type of dataset do you want to import? \n[1]Crane\n[2]Route\n')
            crane={'1','crane','CRANE'}
            trail={'2','trail','TRAIL'}

            # Ask the user in which database the database has to be imported.
            dbname = input('To which database do you want to add the data?\n')

            # If the user chose to import a Crane dataset the following happens:
            if type in crane:
                print("--->> Importing a Crane dataset <<---")
                # Call the Crane data loading function and pass the dataframe
                # columns and database name as parameters.
                load_crane_data(df,columns,dbname)
            # If the user chose to import a Crane dataset the following happens:
            elif type in trail:
                print("--->> Importing a GPS Route dataset <<---")
                # Call the Crane data loading function and pass the dataframe
                # columns and database name as parameters.
                load_trail_data(df,columns,dbname)

            # If the user input is not in the words assigned to the variable:
            # "crane" or the variable: "trail" the following code is executed.
            else:
                print("Not a valid input, please try again\n")

        # If one or more selected_columns are not found the following code is
        # executed
        else:
            # Print the column(s) that was not found.
            print('One or more columns could not be found, please try again!')
            # Rerun this function to restart the column selection.
            transform_data(df)
    # If the dataframe is Invalid the following code will be executed.
    else:
        #Print that the dataframe is Invalid.
        print("Invalid dataframe, please check if the dataset is valid!")
        # Rerun the function.
        transform_data(df)

# Below we create the main function. This function is triggered when the Python
# script is called.
def import_tool():
    # Print the start text in the terminal.
    print('---->>WELCOME TO THE DATASET IMPORT TOOL<<----')

    # Here we ask the user to choose between 3 options. We assign the result
    # of the user input to a variable called:"format"
    format = input(
    'What file format does the dataset have? \n[1]CSV\n[2]JSON\n[3]GPX\n')

    # Here we create the options which the user can select to choose between
    # importing a CSV, JSON or GPX dataset.
    csv = {'1','CSV','csv'}
    json = {'2','JSON','json'}
    gpx = {'3','GPX','gpx'}

    # Here we define the code which is executed depending on the user input.
    # If the user input, which is assigned to a variable called: "format" is
    # in the list of words assigned to variable:"csv" the following code will
    # be executed.
    if format in csv:
        print("--->> Selected CSV file format <<---")
        csv_import()

    # Here we define the code which is executed depending on the user input.
    # If the user input, which is assigned to a variable called: "format" is
    # in the list of words assigned to variable:"json" the following code will
    # be executed.
    elif format in json:
        print("--->> Selected JSON file format <<---")
        json_import()

    # Here we define the code which is executed depending on the user input.
    # If the user input, which is assigned to a variable called: "format" is
    # in the list of words assigned to variable:"gpx" the following code will
    # be executed.
    elif format in gpx:
        print("--->> Selected GPX file format <<---")
        gpx_import()

    # If the user input is not in the words assigned to the variable:"csv" or
    # the variable: "json" the following code is executed.
    else:
        print("Not a valid input, please try again\n")


# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                                                                             #
#                     CREATING THE CRANE DATA LOADING FUNCTION                #
#                                                                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

# Here we import the CraneModel Python file.
import CraneModel

def load_crane_data(df,columns,dbname):

    # Ask the user what the name of the Crane has to be.
    name = input('What is the name of the item you want to import?\n')

    # Here we connect to the database that is passed as parameter (dbname)
    # when the function: "load_crane_data" is triggered.
    connect(str(dbname))

    # Create metadata for the tracker.
    # We use the value at the 3rd index of the list of columns which was passed
    # as parameter in this function. This index contains the value of the column
    # representing the timestamp (which was defined by the user input in the
    # function:"selected_columns()").
    start_Date = df.at[0,columns[3]]
    end_Date = df.at[df.shape[0]-1,columns[3]]
    transmission_Count = df.shape[0]

    # Create a new tracker, this is only done once. We first call the CraneModel
    # import and than the Tracker document in which we pass the required values
    # (from the dataframe which was passed as parameter in this function)
    # as parameters in the Tracker document.
    tracker = CraneModel.Tracker(study_name = df.at[0,'study-name'],
              individual_taxon_canonical_name = df.at[0,'individual-taxon-canonical-name'],
              individual_local_identifier = df.at[0,'individual-local-identifier'],
              start_date = start_Date,
              end_date = end_Date,
              name = name,
              transmission_Count = transmission_Count).save()

    # Create an empty list of transmissions to which will append the new
    # transmissions after they have been created. This list will be passed to
    # the mongodb bulk insert feature.
    transmissions = []

    # Print when list appending process starts.
    print('Start appending transmissions to list from: ' + str(name) )

    # For each row in the dataframe the following code is executed.
    for index,row in df.iterrows():
        # Here we create geometry document.
        # We use the value at the 1st index of the list of columns which was passed
        # as parameter in this function. This index contains the value of the column
        # representing the longitude (which was defined by the user input in the
        # function:"selected_columns()"). We do the same for the latitude column
        # name at index 0 of the Selected columns list and the altitude column
        # name at index 2 of the selected columns list.
        geometry = CraneModel.Geometry(coord = [row[columns[1]],row[columns[0]]],
                            alt = row[columns[2]])

        # Here we create the metadata document in which we pass te required values.
        metadata = CraneModel.TransmissionMetadata(visible = row['visible'],
                           sensor_type = row['sensor-type'],
                           tag_voltage = row['tag-voltage'])

        # Here we create speed document in which we pass te required values.
        speed = CraneModel.Speed(ground_speed = row['ground-speed'])

        # Here we create a transmission document and append it to the
        # transmissions list. We use the value at the 3rd index of the column
        # list, passed in this function, as column name for the timestamp
        # column in the dataframe.
        transmissions.append(CraneModel.Transmission(event_id = row['event-id'],
                                          timestamp = row[columns[3]],
                                          geometry = geometry,
                                          speed = speed,
                                          metadata = metadata,
                                          tracker = tracker))

    # Print when list appending is done.
    print('Bulk inserting: '+str(transmission_Count)+' transmissions from: '+str(name))

    # Bulk insert, the populated transmissions list, in the database.
    CraneModel.Transmission.objects.insert(transmissions,load_bulk=True)

    # Print if the insert process is succesfull.
    print("Done inserting "+ str(len(df.index)) + " transmissions")

    # Print that the indexing process has started.
    print("Creating indexes on database ")

    # Create and index on the tracker field in the Transmissions documents.
    CraneModel.Transmission.create_index(("tracker"))

    # Create and index on the timestamp field in the Transmissions documents.
    CraneModel.Transmission.create_index(("timestamp"))

    # Create and index on the coordinates field in the Transmissions documents.
    CraneModel.Transmission.create_index(("geometry.coord"))

    print("Done importing the dataset!")

    import_tool()


# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                                                                             #
#                     CREATING THE TRAIL DATA LOADING FUNCTION                #
#                                                                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Here we import the TrailModel Python file.
import TrailModel

def load_trail_data(df,columns,dbname):

    # Here we ask the user what the name of the Route should be.
    name = input('What is the name of the item you want to import?\n')

    # Here we ask the user what the abreviation of the Route should be.
    abreviation = input('What do you want the abbreviation to be?\n')

    # Here we ask the user what the type of the Route should be.
    type = input('What type of route is it (e.g. Hike, Bike, Car)?\n')

    # Here we connect to the database which was passed as input in this
    # function.
    connect(str(dbname))

    # Below we create metadata for the Route.

    # Here we get the value of the time column of the first row in the dataframe.
    # We use the value at the 3rd index of the list of columns which was passed
    # as parameter in this function. This index contains the value of the column
    # representing the timestamp (which was defined by the user input in the
    # function:"selected_columns()"). We apply /1000 to remove the UTC (Timezone)
    # info. This is required to create a valid timestamp.
    s_date = datetime.fromtimestamp((df.at[0,columns[3]]/1000))

    # Here we get the value of the time column of the last row in the dataframe.
    # This value is located at the index of the lenght of the dataframe.
    # We pass the value on the 3rd index of the list of columns which was passed
    # as parameter in this function. We apply /1000 to remove the UTC (Timezone)
    # info. This is required to create a valid timestamp.
    e_date = datetime.fromtimestamp((df.at[len(df.index)-1,columns[3]]/1000))

    # Get the total lenght of the dataframe we do this because it's the same
    # as the amount of signals in the dataset.
    t_points = df.shape[0]


    # Create the trial document by calling the Trail document in the TrailModel
    # in which we pass the required values.
    trail = TrailModel.Trail(name = name,
                  s_date = s_date,
                  e_date = e_date,
                  abr = abreviation,
                  r_type = type,
                  t_points = t_points).save()

    # Create an empty list of signals to which we will append all the signal
    # documents after they have been created. We will pass the list to the
    # mongodb bulk insert feature.
    signals = []

    # Here we itterate through all the rows in the dataframe.
    # For each row in the dataframe the following code is executed.
    for index,row in df.iterrows():

        # Convert the datetime to a valid format by removing the timezone info.
        # We use the value at the 3rd index of the list of columns which was
        # passed as parameter in this function.
        time = datetime.fromtimestamp(row[columns[3]]/1000)

        # Here we create the geometry document.
        # We use the value at the 1st index of the list of columns which was passed
        # as parameter in this function. This index contains the value of the column
        # representing the longitude (which was defined by the user input in the
        # function:"selected_columns()"). We do the same for the latitude column
        # name at index 0 of the Selected columns list and the altitude column
        # name at index 2 of the selected columns list.
        geometry = TrailModel.Geometry(coord = [row[columns[1]],row[columns[0]]],
                            alt = row[columns[2]])

        # Here we create a signal document in which we pass the required values.
        signal = TrailModel.Signal(time = time,
                        geometry = geometry,
                        trail = trail)

        # Here we append the created document to the signals list.
        signals.append(signal)

    # Bulk insert, the populated signals list, in the database.
    TrailModel.Signal.objects.insert(signals,load_bulk=True)

    # Print if the insert process is succesfull.
    print("Inserted " + str(len(df.index))+" trackpoints from dataset: " + str(name))

    # Print when starting the indexing process.
    print("Creating indexes on database ")

    # Create and index on the trail field in the Signal documents.
    TrailModel.Signal.create_index(("trail"))

    # Create and index on the time field in the Signal documents.
    TrailModel.Signal.create_index(("time"))

    # Create and index on the coordinates field in the Signal documents.
    TrailModel.Signal.create_index(("geometry.coord"))

    print("Done importing the dataset!")

    import_tool()

import_tool()
