# MongoEngine is used to create the datamodel and load the data according
# to the datamodel.
from mongoengine import *

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                                                                             #
#                     CREATING THE TRAIL DATABASE MODEL                       #
#                                                                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
class Trail(Document):

    # Name of the Trail
    name = StringField()

    # Abreviation of the Name
    abr = StringField()

    # Start date
    s_date= DateTimeField()

    # End date
    e_date = DateTimeField()

    # Trail type (Biking,Hiking,Driving)
    r_type = StringField()

    # Amount of trackpoints in the dataset
    t_points = IntField()

class Geometry(EmbeddedDocument):

    # coordinates of signal coord=[1,2]
    coord = PointField()

    # altitude of signal
    alt = FloatField()

class Signal(Document):

    # Timestamp of signal
    time = DateTimeField()

    # Geometry of signal
    geometry = EmbeddedDocumentField(Geometry)

    # Reference to the route of signal
    trail = ReferenceField(Trail)
