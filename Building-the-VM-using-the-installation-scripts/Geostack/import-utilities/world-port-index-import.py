import psycopg2
import os

os.system('PGPASSWORD="geostack" createdb "World_Port_Index_Database" -h localhost -p 5432 -U postgres')

conn = psycopg2.connect(host='localhost',
                        dbname='World_Port_Index_Database',
                        user='postgres',
                        password='geostack',
                        port=5432)

cursor = conn.cursor()

cursor.execute('CREATE EXTENSION IF NOT EXISTS postgis;')
cursor.execute('CREATE EXTENSION IF NOT EXISTS postgis_topology;')
conn.commit()
conn.close()


os.system('shp2pgsql -I -s 4326 "/home/geostack/Geostack/datasets/SHP/World-Port-Index/WPI.shp" WPI | PGPASSWORD="geostack" psql -h localhost -p 5432 -U postgres -d World_Port_Index_Database')
