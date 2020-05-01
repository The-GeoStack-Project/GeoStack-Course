/*
Here we import some basice modules from Angular.
The HttpClient module is required to make requests to our API.
*/
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

/*
Here we create a class called CraneService. This class will be instantiated
in the MapComponent which we will create later. This class will contain all the
functions which are required to perform API requests to our Flask-API.

The class contains functions related to requesting Crane data from our MongoDB
datastore.
*/
@Injectable()
export class CraneService {

    /*
    Here we create class constructor and pass an instance of an HttpClient.
    The HttpClient is used to perform the following requests to our Flask-API:
    1) GET requests
    2) POST requests
    3) PUT requests
    For more info on the types of requests you can visit the following URL:
    https://www.tutorialspoint.com/http/http_requests.htm
    */
    constructor(private http: HttpClient) {}

    /*
    Here we create a function called: "getTrackers()", which is used to perform an
    HTTP GET request to our Flask-API.

    The function performs a request on the following URL:api/trackers/.
    This URL is bound to a function in our Flask-API. The function, bound to this
    URL, executes a query on our MongoDB datastore and retrieves all trackers from
    the MongoDB datastore.

    The function:"getTrackers()" then returns all the trackers to our MapComponent.
    */
    getTrackers(): Observable < any[] > {
        return this.http.get < any[] > ('api/trackers/')
    };

    /*
    Here we create a function called: "getTracker()", which is used to perform an
    HTTP GET request to our Flask-API.

    The function performs a request on the following URL:api/trackers/{id}.
    This URL is bound to a function in our Flask-API. The function, bound to this
    URL, executes a query on our MongoDB datastore and retrieves a tracker which
    has the id passed in this function,from the MongoDB datastore.

    The function:"getTracker()" then returns the tracker to our MapComponent.
    */
    getTracker(id: string): Observable < any[] > {
        return this.http.get < any > (`api/trackers/${id}`)
    };

    /*
    Here we create a function called: "getTransmissionsID()", which is used
    to perform an HTTP GET request to our Flask-API.

    The function performs a request on the following URL:
    api/transmissions_by_id/${id}.

    This URL is bound to a function in our Flask-API. The function, bound to this
    URL, executes a query on our MongoDB datastore and retrieves all
    transmissions belonging to a tracker that has the id passed in this function.

    The function:"getTransmissionsID()" then returns the transmissions to our
    MapComponent.
    */
    getTransmissionsID(id: string): Observable < any[] > {
        return this.http.get < any[] > (
            `api/transmissions_by_id/${id}`)
    };

    /*
    Here we create a function called: "getTransmissionsAmount()", which is used
    to perform an HTTP GET request to our Flask-API.

    The function performs a request on the following URL:
    api/transmissions_by_amount/${id}/${amount}

    This URL is bound to a function in our Flask-API. The function, bound to this
    URL, executes a query on our MongoDB datastore and retrieves all
    transmissions belonging to a tracker that has the id passed in this function.

    The amount of transmissions it returns is the amount passed in the function
    call.

    The function:"getTransmissionsAmount()" then returns the transmissions to our
    MapComponent.
    */
    getTransmissionsAmount(id: string, amount: number): Observable < any[] > {
        return this.http.get < any[] > (
            `api/transmissions_by_amount/${id}/${amount}`)
    };

    /*
    Here we create a function called: "getTransmissionsDTG()", which is used
    to perform an HTTP GET request to our Flask-API.

    The function performs a request on the following URL:
    api/transmissions_by_dtg/${id}/${dtg_1}/${dtg_2}

    This URL is bound to a function in our Flask-API. The function, bound to this
    URL, executes a query on our MongoDB datastore and retrieves an N amount of
    transmissions between the start date(dtg_1) and the end date (dtg_2)
    belonging to a tracker that has the id passed in this function.

    The function:"getTransmissionsDTG()" then returns the transmissions to our
    MapComponent.
    */
    getTransmissionsDTG(id: string, dtg_1: string, dtg_2: string): Observable < any[] > {
        return this.http.get < any[] > (
            `api/transmissions_by_dtg/${id}/${dtg_1}/${dtg_2}`)
    };

    /*
    Here we create a function called: "getTransmissionsCountry()", which is used
    to perform an HTTP GET request to our Flask-API.

    The function performs a request on the following URL:
    api/transmissions_in_polygon/${id}/${coords}

    This URL is bound to a function in our Flask-API. The function, bound to this
    URL, executes a query on our MongoDB datastore and retrieves all transmissions
    of which the coordinates reside in the list of coordinates passed as paramater
    in the function, belonging to a tracker that has the id passed in this function.

    The function:"getTransmissionsCountry()" then returns the transmissions to our
    MapComponent.
    */
    getTransmissionsCountry(
        id: string, coords: Number[][]): Observable < any[] > {
        return this.http.get < any[] > (
            `api/transmissions_in_polygon/${id}/${coords}`)
    };
}
