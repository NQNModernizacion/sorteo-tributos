import { Injectable } from '@angular/core';
import { Impuesto } from '../models/impuesto.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SorteoService {

  constructor(private httpClient: HttpClient) { }


  getNumero(impuesto: Impuesto) {
    return this.httpClient.post(`${environment.apiUrlProd}/api/Sorteo/GetNumero`, impuesto);
  }

}
