from mongoengine import *
from datetime import datetime
import pandas as pd

# Here we import the CraneModel Python file.
import CraneModel


def load_data(df,name,country):

    start_Date = df.at[0,'timestamp']
    end_Date = df.at[df.shape[0]-1,'timestamp']
    transmission_Count = df.shape[0]

    tracker = CraneModel.Tracker(study_name = df.at[0,'study-name'],
                    individual_taxon_canonical_name  = df.at[0,'individual-taxon-canonical-name'],
                    individual_local_identifier = df.at[0,'individual-local-identifier'],
                    start_date = start_Date,
                    end_date = end_Date,
                    name = name,
                    transmission_Count = transmission_Count).save()

    transmissions = []

    print('Start appending transmissions to list from: ' + str(name) )

    for index,row in df.iterrows():


       if country == "sw":
            geometry = CraneModel.Geometry(coord = [row['location-long'],row['location-lat']],
                                alt = row['height-above-ellipsoid'])
       else:
            geometry = CraneModel.Geometry(coord = [row['location-long'],row['location-lat']],
                                alt = row['height-above-msl'])

       metadata = CraneModel.TransmissionMetadata(visible = row['visible'],
                           sensor_type = row['sensor-type'],
                           tag_voltage = row['tag-voltage'])

       speed = CraneModel.Speed(ground_speed = row['ground-speed'])

       transmissions.append(CraneModel.Transmission(event_id = row['event-id'],
                                          timestamp = row['timestamp'],
                                          geometry = geometry,
                                          speed = speed,
                                          metadata = metadata,
                                          tracker = tracker))

    print('Bulk inserting: '+ str(transmission_Count) + ' transmissions from: ' + str(name) )

    CraneModel.Transmission.objects.insert(transmissions,load_bulk=True)


    print("Done inserting "+ str(len(df.index)) + " transmissions")


def import_data():
    connect('Crane_Database')

    print("Starting import of Crane datasets")

    load_data(pd.read_json('~/Geostack/datasets/JSON/Crane_JSON/Agnetha-SW.json'),"Agnetha","sw")
    load_data(pd.read_json('~/Geostack/datasets/JSON/Crane_JSON/Frida-SW.json'),"Frida","sw")
    load_data(pd.read_json('~/Geostack/datasets/JSON/Crane_JSON/Cajsa-SW.json'),"Cajsa","sw")

    load_data(pd.read_json('~/Geostack/datasets/JSON/Crane_JSON/Nena-GE.json'),"Nena","ge")
    load_data(pd.read_json('~/Geostack/datasets/JSON/Crane_JSON/Lotta-GE.json'),"Lotta","ge")

    #load_data(pd.read_json('~/Geostack/datasets/JSON/Crane_JSON/Lita-LT.json'),"Lita","lt")
    print("Finished import")

    CraneModel.Transmission.create_index(("tracker"))
    CraneModel.Transmission.create_index(("timestamp"))
    CraneModel.Transmission.create_index(("geometry.coord"))


import_data()
