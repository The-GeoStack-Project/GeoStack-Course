# The os module is used to execute bash commands in the Python script.
import os,subprocess
# The tkinter module is used to create a GUI.
import tkinter
# The filedialog module is used to show a file selection GUI.
from tkinter import filedialog

# Below we create the main function. This function is triggered when the Python
# script is called.
def import_tool():

    # Print the start text in the terminal.
    print('---->>WELCOME TO THE OSM IMPORT TOOL<<----')

    # Create a new instance of a Tkinter GUI.
    GUI = tkinter.Tk()
    # This line makes sure the GUI is instantiated in the background.
    GUI.withdraw()

    # Here we create the options which the user can select to choose between
    # importing OpenStreetMap data or generating OpenSeaMap tiles.
    ostreetm = {'1','ostreetm','openstreetmap'}
    oseam = {'2','oseam','openseamap'}

    # Here we ask the user to choose between 2 options. We assign the result
    # of the user input to a variable called:"u_input"
    u_input = input('What do you want to do?\
     \n[1] Import OpenStreetMap data\
      \n[2] Generate OpenSeaMap Tiles \n')

    # Here we define the code which is executed depending on the user input.
    # If the user input, which is assigned to a variable called: "u_input" is
    # in the list of words assigned to variable:"ostreetm" the following code
    # will be executed.
    if u_input in ostreetm:

        # Here we add the code logic required to open the selection GUI.
        # The following parameters are passed in this code:
        # - parent = the instance of the Tkinter GUI
        # - filetypes = specifies the extensions which are allowed to be selected
        #               since the user chose to import OpenStreetMap data,
        #               we are only allowing osm.pbf files to be selected.
        # - title = the text displayed at the top of the GUI.
        input_file = filedialog.askopenfilename(
        parent=GUI,filetypes=[('OSM.PBF file','*.osm.pbf')],
                             title='Choose an osm.pbf file')

        # Here we check if the selected file is not equal to None.
        # If this is the case the following code is executed.
        if input_file != None:

            # Print that the file is valid.
            print("Selected file is valid!")

            # Call the function:"import_osteetm" and pass the selected file
            # as parameter.
            import_osteetm(input_file)

    # Here we define the code which is executed depending on the user input.
    # If the user input, which is assigned to a variable called: "u_input" is
    # in the list of words assigned to variable:"oseam" the following code
    # will be executed.
    elif u_input in oseam:

        # Here we add the code logic required to open the selection GUI.
        # Here we pass .osm as the filetypes parameter.
        input_file = filedialog.askopenfilename(
        parent=GUI,filetypes=[('.OSM file','*.osm')],title='Choose an osm file')

        # Here we check if the selected file is not equal to None.
        # If this is the case the following code is executed.
        if input_file != None:

            # Print that the file is valid.
            print("Selected file is valid!")

            # Call the function:"import_oseam" and pass the selected file
            # as parameter.
            import_oseam(input_file)

# Here we create a function called:"import_osteetm".
# This function takes an input file as input parameter.
def import_osteetm(input_file):

    # Here we create the options which the user can select to choose between
    # importing in a docker container on in the local postgresql instance.
    local = {'1','local'}
    docker = {'2','docker'}

    # Here we ask the user to choose between 2 options. We assign the result
    # of the user input to a variable called:"u_input"
    u_input = input('Do you want to import in a local or docker database?\
    \n If you are importing in a Docker container, please make sure the container is running! \
     \n[1] local\
      \n[2] docker\n')

    if u_input in local:
        # Print that the import process has started.
        print("Executing the local import command for file: "+ input_file)
        server = "localhost"
        user = "geostack"

    if u_input in docker:
        # Print that the import process has started.
        print("Executing the Docker import command for file: "+ input_file)
        docker_ip = subprocess.Popen("docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgresql-datastore",
                           shell=True,
                           stdout=subprocess.PIPE).communicate()[0].decode('utf-8').strip()
        server = docker_ip
        user = "postgres"

    # Here we create the osm2pgsql command. For more info on this command
    # read section 5.5.3.1.
    command = 'osm2pgsql -d gis -H '+server+' -P 5432 -U '+user+' -W --create\
     --slim -G --hstore --tag-transform-script\
      ~/Geostack/tilestache-server/openstreetmap-carto/openstreetmap-carto.lua\
       -C 3500 --number-processes 4 -S\
        ~/Geostack/tilestache-server/openstreetmap-carto/openstreetmap-carto.style\
         '+ input_file

    # Here we execute the command which we created above
    os.system(command)

    os.system('echo "done importing the data"')

    import_tool()
# Here we create a function called:"import_oseam".
# This function takes an input file as input parameter.
def import_oseam(input_file):
    print("Running Generation command for file: " + input_file)

    # Create the command to rename the input_file to next.osm and move the
    # file to the /renderer/work directory.
    command = 'cp '+ input_file + '\
     ~/Geostack/tilestache-server/renderer/work/next.osm'

    # Execute the command which we created above.
    os.system(command)

    # Print that the command above was executed succesfully.
    print("Copied and renamed:" + input_file + " to next.osm")

    # Print that the tile rendering process has started.
    print("Executing the rendering scripts. Please be patient!")

    # Create the command that runs the render and tilegen scripts.
    command = 'cd /home/geostack/Geostack/tilestache-server/renderer/work\
     && ./render && ./tilegen'

    # execute the command which we created above.
    os.system(command)
    os.system('echo "done generating tiles"')

    import_tool()

import_tool()
