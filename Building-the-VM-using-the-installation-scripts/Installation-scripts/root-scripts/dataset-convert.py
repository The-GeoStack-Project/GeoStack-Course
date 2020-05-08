
import gpxpy
import datetime
import pandas as pd
import os

input_location_gpx = '/home/geostack/GeoStack-Course/Course-Datasets/GPX/'
output_location_gpx = '/home/geostack/Geostack/datasets/JSON/Trail_JSON/'

input_location_csv = '/home/geostack/GeoStack-Course/Course-Datasets/CSV/'
output_location_csv = '/home/geostack/Course-Datasets/JSON/Crane_JSON/'


def create_df(data):

    df = pd.DataFrame(columns=['lon', 'lat', 'alt', 'time'])

    for point in data:
        df = df.append({'lon': point.longitude,
                        'lat' : point.latitude,
                        'alt' : point.elevation,
                        'time' : point.time}, ignore_index=True)
    return df

def parse_transform_GPX(input_file,output_file):

    input_location = input_location_gpx + input_file

    output_location = output_location_gpx + output_file

    parsed_file =  gpxpy.parse(open(input_location, 'r'))

    df = create_df(parsed_file.tracks[0].segments[0].points)

    df.to_json(output_location,orient='records')

    print("transformed: "+input_file+" to: " + output_file)


def filter_transform_CSV(input_file,output_file,country):

    input_location = input_location_csv+input_file

    output_location = output_location_csv+output_file

    df = pd.read_csv(input_location,low_memory=False)

    if country == "sw":
        columns_to_filter = ['event-id', 'study-name',
                     'timestamp','visible',
                     'ground-speed','heading',
                     'location-long','location-lat',
                     'height-above-ellipsoid',
                     'individual-taxon-canonical-name',
                     'sensor-type','tag-voltage',
                     'individual-local-identifier']
    elif country == "ge":
        columns_to_filter = ['event-id', 'study-name',
                     'timestamp','visible',
                     'ground-speed','heading',
                     'location-long','location-lat',
                     'height-above-msl',
                     'individual-taxon-canonical-name',
                     'sensor-type','tag-voltage',
                     'individual-local-identifier']

        return "ge"
    elif country == "lt":
        columns_to_filter = ['event-id', 'study-name',
                     'timestamp','visible',
                     'ground-speed','heading',
                     'location-long','location-lat',
                     'height-above-msl',
                     'individual-taxon-canonical-name',
                     'sensor-type','tag-voltage',
                     'individual-local-identifier']
        return "lt"
    else:
        return "invalid country"

    filtered_df = df[columns_to_filter]

    filtered_df.to_json(output_location,orient='records')

    print("transformed: "+input_file+" to: " + output_file)


os.system('mkdir /home/geostack/Geostack/datasets')


os.system('cp -r /home/geostack/GeoStack-Course/Course-Datasets/GPX /home/geostack/Geostack/datasets/')
os.system('mkdir -p /home/geostack/Geostack/datasets/JSON/Trail_JSON')
parse_transform_GPX("JAN-16-11 172053 Zeeland MNV.gpx",'Trail_ZeelandMNV.json')
parse_transform_GPX("SEP-26-09 64311 Biesbosch.gpx",'Trail_Biesbosch.json')
parse_transform_GPX("JUN-03-11 151845 BiesboschLibellen.gpx",'Trail-Biesbosch-Libellen.json')
parse_transform_GPX("SEP-25-09 182235 Hamert.gpx",'Trail-Hamert-Hike.json')
parse_transform_GPX("OKT-25-09 164243 Hamert Fiets.gpx",'Trail-Hamert-Bike.json')


os.system('cp -r /home/geostack/GeoStack-Course/Course-Datasets/CSV /home/geostack/Geostack/datasets/')
os.system('mkdir -p /home/geostack/Geostack/datasets/JSON/Crane_JSON')
filter_transform_CSV('20200103_Movebank_Common_Crane_Lithuania_GPS_2016_Dataset.csv','Lita-LT.json',"lt")
filter_transform_CSV('20181003_Dataset_SV_GPS_Crane_9381_STAW_Crane_RRW-BuGBk_Frida.csv','Frida-SW.json',"sw")
filter_transform_CSV('20181003_Dataset_SV_GPS_Crane_9407_STAW_Crane_RRW-BuGBk_Agnetha.csv','Agnetha-SW.json',"sw")
filter_transform_CSV('20181003_Dataset_SV_GPS_Crane_9472_STAW_Crane_RRW-BuGR_Cajsa.csv','Cajsa-SW.json',"sw")
filter_transform_CSV('20191103_Dataset_DE_GPS_Crane_181528_iCora_Crane_15_BuBuBr-WYW_Lotta.csv','Lotta-GE.json',"ge")
filter_transform_CSV('20180928_Dataset_DE_GPS_Crane_181527_iCora_Crane_13_BuBuBr-YBuBk.csv','Nena-GE.json',"ge")

os.system('cp -r /home/geostack/GeoStack-Course/Course-Datasets/SHP /home/geostack/Geostack/datasets/')
os.system('cp -r /home/geostack/GeoStack-Course/Course-Datasets/OSM /home/geostack/Geostack/datasets/')

