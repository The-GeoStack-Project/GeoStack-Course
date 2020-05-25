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

    getTrails(): Observable<any[]> {
        return this.http.get<any[]>('api/trails/')
    }

    getTrail(id:string): Observable<any> {
        return this.http.get<any>(`api/trails/${id}`)
    }

    getSignalsID(id:string): Observable<any[]> {
        return this.http.get<any[]>(`api/signals_by_id/${id}`)
    }

    getSignalsAmount(id:string,amount:number): Observable<any[]> {
        return this.http.get<any[]>(`api/signals_by_amount/${id}/${amount}`)
    }

    getSignalsDTG(id:string,dtg_1:string,dtg_2:string): Observable<any[]> {
        return this.http.get<any[]>(`api/signals_by_dtg/${id}/${dtg_1}/${dtg_2}`)
    }
}
