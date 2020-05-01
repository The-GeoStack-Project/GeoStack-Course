from mongoengine import *
from datetime import datetime
import pandas as pd

# Here we import the TrailModel Python file.
import TrailModel


# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                                                                             #
#                  LOADING THE TRIAL DATA IN DATABASE                         #
#                                                                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

def load_data(df,name,abreviation,type):

    s_date = datetime.fromtimestamp((df.at[0,'time']/1000))

    e_date = datetime.fromtimestamp((df.at[len(df.index)-1,'time']/1000))

    t_points = df.shape[0]

    trail = TrailModel.Trail(name = name,
                  s_date = s_date,
                  e_date = e_date,
                  abr = abreviation,
                  r_type = type,
                  t_points = t_points)
    trail.save()

    signals = []

    for index,row in df.iterrows():

        time = datetime.fromtimestamp(row['time']/1000)

        geometry = TrailModel.Geometry(coord = [row['lon'],row['lat']],
                            alt = row['alt'])

        singal = TrailModel.Signal(time = time,
                        geometry = geometry,
                        trail = trail)

        signals.append(singal)

    TrailModel.Signal.objects.insert(signals,load_bulk=True)

    print("Inserted " + str(len(df.index))+" trackpoints from dataset: " + str(name))


# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                                                                             #
#                           LOAD DATASETS USING PANDAS                        #
#                                                                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

def import_data():
    connect('Trail_Database')

    print("Starting import")

    load_data(pd.read_json('~/Geostack/datasets/JSON/Trail_JSON/Trail_Biesbosch.json'),'Biesbosch','B','Boat & Hike')
    load_data(pd.read_json('~/Geostack/datasets/JSON/Trail_JSON/Trail_ZeelandMNV.json'),"Zeeland Camper",'ZC',"Car")
    load_data(pd.read_json('~/Geostack/datasets/JSON/Trail_JSON/Trail-Biesbosch-Libellen.json'),"Biesbosch Libellen",'BL',"Hike")
    load_data(pd.read_json('~/Geostack/datasets/JSON/Trail_JSON/Trail-Hamert-Hike.json'),"Hamert Hike",'HH',"Hike")
    load_data(pd.read_json('~/Geostack/datasets/JSON/Trail_JSON/Trail-Hamert-Bike.json'),"Hamert Bike",'HB',"Bike")


    TrailModel.Signal.create_index(("trail"))
    TrailModel.Signal.create_index(("time"))
    TrailModel.Signal.create_index(("geometry.coord"))

    print('Done importing')

import_data()
