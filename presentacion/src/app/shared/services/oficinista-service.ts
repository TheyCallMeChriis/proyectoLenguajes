import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TipoOficinista } from '../models/TipoOficinista';

const _SERVER = environment.servidor;

@Injectable({
  providedIn: 'root'
})
export class OficinistaService {
  private readonly http = inject(HttpClient);
  constructor() {}

  filtrar(parametros: any): Observable<TipoOficinista[]> {
    let params = new HttpParams();
    for (const prop in parametros) {
      if (parametros.hasOwnProperty(prop)) {
        params = params.append(prop, parametros[prop]);
      }
    }

    return this.http.get<TipoOficinista[]>(`${_SERVER}/api/oficinista/filtrar/0/5`, {
      params: params
    });
  }

  guardar(datos: TipoOficinista, id?: number): Observable<TipoOficinista> {
    delete datos.id; // eliminar id autoincremental antes de enviar

    if (id) {
   
      return this.http.put<TipoOficinista>(`${_SERVER}/api/oficinista/${id}`, datos);
    }
    return this.http.post<TipoOficinista>(`${_SERVER}/api/oficinista`, datos);
  }

  eliminar(id: number): Observable<boolean> {
    return this.http.delete(`${_SERVER}/api/oficinista/${id}`).pipe(
      retry(1),
      map(() => true),
      catchError(this.handleError)
    );
  }

  buscar(id: number): Observable<TipoOficinista> {
    return this.http.get<TipoOficinista>(`${_SERVER}/api/oficinista/${id}`);
  }

  private handleError(error: any) {
    return throwError(() => error.status);
  }
}