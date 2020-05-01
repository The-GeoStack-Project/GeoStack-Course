# MongoEngine is used to create the datamodel and load the data according
# to the datamodel.
from mongoengine import *

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                                                                             #
#                     CREATING THE CRANE DATABASE MODEL                       #
#                                                                             #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

class Tracker(Document):

    # Name of the study
    study_name = StringField()

    # Name of the bird, in latin.
    individual_taxon_canonical_name = StringField()

    # Id of the crane
    individual_local_identifier = IntField()

    #Start date of the study
    start_date = DateTimeField()

    #End date of the study
    end_date = DateTimeField()

    #Name of the crane
    name = StringField()

    #Amount of the transmissions related to the tracker
    transmission_Count= IntField()

class TransmissionMetadata(EmbeddedDocument):

    #Is the tracker still visible or not?
    visible = BooleanField()

    # Type of sensor used in tracker.
    sensor_type = StringField()

    # Voltage level of the tracker.
    tag_voltage = FloatField()

class Geometry(EmbeddedDocument):

    # The coordinates of transmission
    # PointField automatically adds an 2dspehere index
    coord = PointField()

    # altitude of tansmission
    alt = FloatField()

class Speed(EmbeddedDocument):

    # Speed of the Crane
    ground_speed = FloatField()

    # Heading of the Crane in degrees
    heading = IntField()

class Transmission(Document):

    # Identifier of the transmission
    event_id = IntField()

    # Timestamp of when transmission was send
    timestamp = DateTimeField()

    # Embedded geometry of transmission
    geometry = EmbeddedDocumentField(Geometry)

    # Embedded speed related data of transmission
    speed = EmbeddedDocumentField(Speed)

    # Embedded metadata of transmission
    metadata = EmbeddedDocumentField(TransmissionMetadata)

    # Reference to the tracker the transmission belongs to
    tracker = ReferenceField(Tracker)
