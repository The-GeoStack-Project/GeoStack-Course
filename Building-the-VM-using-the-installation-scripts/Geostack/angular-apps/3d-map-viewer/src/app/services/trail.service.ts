/*
Here we import some basice modules from Angular.
The HttpClient module is required to make requests to our API.
*/
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

/*
Here we create a class called TrailService. This class will be instantiated
in the MapComponent which we will create later. This class will contain all the
functions which are required to perform API requests to our Flask-API.

The class contains functions related to requesting GPS-Route (Trail) data from
our MongoDB datastore.
*/
@Injectable()
export class TrailService {

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
  Here we create a function called: "getTrails()", which is used to perform an
  HTTP GET request to our Flask-API.

  The function performs a request on the following URL:api/trails/.
  This URL is bound to a function in our Flask-API. The function, bound to this
  URL, executes a query on our MongoDB datastore and retrieves all trails from
  the MongoDB datastore.

  The function:"getTrails()" then returns all the trails to our MapComponent.
  */
  getTrails(): Observable < any[] > {
      return this.http.get < any[] > ('/api/trails/')
  };

  /*
  Here we create a function called: "getTrail()", which is used to perform an
  HTTP GET request to our Flask-API.

  The function performs a request on the following URL:api/trails/{id}.
  This URL is bound to a function in our Flask-API. The function, bound to this
  URL, executes a query on our MongoDB datastore and retrieves a trail which
  has the id passed in this function,from the MongoDB datastore.

  The function:"getTrail()" then returns the trail to our MapComponent.
  */
  getTrail(id: string): Observable < any[] > {
      return this.http.get < any > (`/api/trails/${id}`)
  };

  /*
  Here we create a function called: "getSignalsID()", which is used
  to perform an HTTP GET request to our Flask-API.

  The function performs a request on the following URL:
  api/signals_by_id/${id}.

  This URL is bound to a function in our Flask-API. The function, bound to this
  URL, executes a query on our MongoDB datastore and retrieves all
  signals belonging to a trail that has the id passed in this function.

  The function:"getSignalsID()" then returns the signals to our
  MapComponent.
  */
  getSignalsID(id: string): Observable < any[] > {
      return this.http.get < any[] > (
          `/api/signals_by_id/${id}`)
  };

  /*
  Here we create a function called: "getSignalsAmount()", which is used
  to perform an HTTP GET request to our Flask-API.

  The function performs a request on the following URL:
  api/signals_by_amount/${id}/${amount}

  This URL is bound to a function in our Flask-API. The function, bound to this
  URL, executes a query on our MongoDB datastore and retrieves all
  signals belonging to a trail that has the id passed in this function.

  The amount of signals it returns is the amount passed in the function
  call.

  The function:"getSignalsAmount()" then returns the signals to our
  MapComponent.
  */
  getSignalsAmount(id: string, amount: number): Observable < any[] > {
      return this.http.get < any[] > (
          `/api/signals_by_amount/${id}/${amount}`)
  };

  /*
  Here we create a function called: "getSignalsDTG()", which is used
  to perform an HTTP GET request to our Flask-API.

  The function performs a request on the following URL:
  api/signals_by_dtg/${id}/${dtg_1}/${dtg_2}

  This URL is bound to a function in our Flask-API. The function, bound to this
  URL, executes a query on our MongoDB datastore and retrieves an N amount of
  signals between the start date(dtg_1) and the end date (dtg_2)
  belonging to a trail that has the id passed in this function.

  The function:"getSignalsDTG()" then returns the signals to our
  MapComponent.
  */
  getSignalsDTG(id: string, dtg_1: string, dtg_2: string): Observable < any[] > {
      return this.http.get < any[] > (
          `/api/signals_by_dtg/${id}/${dtg_1}/${dtg_2}`)
  };

  /*
  Here we create a function called: "getSignalsCountry()", which is used
  to perform an HTTP GET request to our Flask-API.

  The function performs a request on the following URL:
  api/signals_in_polygon/${id}/${coords}

  This URL is bound to a function in our Flask-API. The function, bound to this
  URL, executes a query on our MongoDB datastore and retrieves all signals
  of which the coordinates reside in the list of coordinates passed as paramater
  in the function, belonging to a trail that has the id passed in this function.

  The function:"getSignalsCountry()" then returns the signals to our
  MapComponent.
  */
  getSignalsCountry(
      id: string, coords: Number[][]): Observable < any[] > {
      return this.http.get < any[] > (
          `/api/signals_in_polygon/${id}/${coords}`)
  };
};
