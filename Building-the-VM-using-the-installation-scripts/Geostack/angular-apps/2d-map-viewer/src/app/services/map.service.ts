/*
Here we import some basice modules from Angular.
The HttpClient module is required to make requests to our API.
*/
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

@Injectable()

/*
Here we create a class called MapService. This class will be instantiated
in the MapComponent which we will create later.
*/
export class MapService {

    /*
    Here we the class constructor. We pass the HttpClient and assign it to a
    variable called: "http". If we want to perform HTTP requests we first need
    to call the instance of the HttpClient by using this variable.
    */
    constructor(private http: HttpClient) { }

    /*
    Here we create a function called: "getTilestacheEntries()". When the
    function is called in the MapComponent it will perform an HTTP GET request
    on the Flask-API, which will then activate the function which is bound to
    the URL: /api/get_tilestache_entries/. The function bound to this URL
    scrapes all the entries in our Tilestache configuration and returns them as
    a list. We need these entries to switch between WMS's (Web Map servers)
    */
    getTilestacheEntries(): Observable<any[]> {
        return this.http.get<any>(`/api/get_tilestache_entries/`)
    }
}
