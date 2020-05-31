import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

import { Observable } from 'rxjs'

@Injectable()
export class PortService {
    constructor(private http: HttpClient) { }

    getPorts(): Observable<any[]> {
        return this.http.get<any[]>('/api/ports/')
    };
};
