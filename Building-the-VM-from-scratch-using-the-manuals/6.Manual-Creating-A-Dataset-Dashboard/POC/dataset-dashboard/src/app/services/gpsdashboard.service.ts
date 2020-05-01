/*Here we import some basic modules required to create the service.*/
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

/*Here we create an Injectable and exportable class called GPSDashboardService*/
@Injectable()
export class GPSDashboardService {

  /*
  Here we create class constructor and pass an instance of an HttpClient.
  The HttpClient is used to perform the following requests to our Flask-API:
  1) GET requests
  2) POST requests
  3) PUT requests
  For more info on the types of requests you can visit the following URL:
  https://www.tutorialspoint.com/http/http_requests.htm
  */
  constructor(private http: HttpClient) { }

  /*
  Here we create a function called: "getTrackers()", which is used to perform an
  HTTP GET request to our Flask-API.

  The function performs a request on the following URL:api/trackers/.
  This URL is bound to a function in our Flask-API. The function, bound to this
  URL, executes a query on our MongoDB datastore and retrieves all trackers from
  the MongoDB datastore.

  The function:"getTrackers()" then returns all the trackers to our GPSDashboard.
  */
  getTrackers(): Observable<any[]> {
    return this.http.get<any[]>('api/trackers/')
  }

  /*
  Here we create a function called: "getTracker()", which is used to perform an
  HTTP GET request to our Flask-API.

  The function performs a request on the following URL:api/trackers/{id}.
  This URL is bound to a function in our Flask-API. The function, bound to this
  URL, executes a query on our MongoDB datastore and retrieves a tracker which
  has the id passed in this function,from the MongoDB datastore.

  The function:"getTracker()" then returns the tracker to our GPSDashboard.
  */
  getTracker(id:string): Observable<any[]> {
    return this.http.get<any[]>(`api/trackers/${id}`)
  }

  /*
  Here we create a function called: "getTransmissionCount()", which is used to
  perform an HTTP GET request to our Flask-API.

  The function performs a request on the following URL:api/transmissions_count/
  This URL is bound to a function in our Flask-API.

  The function, bound to this URL, executes a query on our MongoDB datastore and
  retrieves the total amount of transmissions from the MongoDB datastore.

  The function:"getTransmissionCount()" then returns the amount to our
  GPSDashboard.
  */
  getTransmissionCount(): Observable<any[]> {
      return this.http.get<any[]>(`api/transmissions_count/`)
  }

  /*
  Here we create a function called: "getTrails()", which is used to perform an
  HTTP GET request to our Flask-API.

  The function performs a request on the following URL:api/trails/.
  This URL is bound to a function in our Flask-API. The function, bound to this
  URL, executes a query on our MongoDB datastore and retrieves all trackers from
  the MongoDB datastore.

  The function:"getTrails()" then returns all the trails to our GPSDashboard.
  */
  getTrails(): Observable<any[]> {
  return this.http.get<any[]>('api/trails/')
  }

  /*
  Here we create a function called: "getTrail()", which is used to perform an
  HTTP GET request to our Flask-API.

  The function performs a request on the following URL:api/trails/{id}.
  This URL is bound to a function in our Flask-API. The function, bound to this
  URL, executes a query on our MongoDB datastore and retrieves a trail which
  has the id passed in this function,from the MongoDB datastore.

  The function:"getTrail()" then returns the trail to our GPSDashboard.
  */
  getTrail(id:string): Observable<any[]> {
      return this.http.get<any[]>(`api/trails/${id}`)
  }

  /*
  Here we create a function called: "getSignalCount()", which is used to
  perform an HTTP GET request to our Flask-API.

  The function performs a request on the following URL:api/signals_count/
  This URL is bound to a function in our Flask-API.

  The function, bound to this URL, executes a query on our MongoDB datastore and
  retrieves the total amount of signals from the MongoDB datastore.

  The function:"getSignalCount()" then returns the amount to our
  GPSDashboard.
  */
  getSignalCount(): Observable<any[]> {
      return this.http.get<any[]>(`api/signals_count/`)
  }
}
