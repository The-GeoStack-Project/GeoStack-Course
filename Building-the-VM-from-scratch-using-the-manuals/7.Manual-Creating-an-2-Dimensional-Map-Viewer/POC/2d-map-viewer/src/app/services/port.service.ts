// Here we import the required Angular Modules
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { Observable } from 'rxjs'

/*
Here we create a class called:"PortService".
The class contains all the functions related to requesting World Port Index data
from our PostgreSQL databe: World_Port_Index_Database via our Flask-API.
*/
@Injectable()
export class PortService {

    // Here we create the class constructor.
    constructor(private http: HttpClient) { }


    /*
    Here we create a function called: "getPorts()", which is used
    to perform an HTTP GET request to our Flask-API.

    The function performs a request on the following URL:
    /api/ports

    This URL is bound to a function in our Flask-API. The function, bound to this
    URL, executes a query on our PostgreSQL database: "World_Port_Index_Database"
    which will the return all the ports in the database.

    The function:"getPorts()" then returns the ports to our
    MapComponent.
    */
    getPorts(): Observable<any[]> {
        return this.http.get<any[]>('/api/ports/')
    };
};
