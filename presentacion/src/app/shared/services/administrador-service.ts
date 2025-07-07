import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TipoAdministrador } from '../models/TipoAdministrador'; 

const _SERVER = environment.servidor;

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  private readonly http = inject(HttpClient);
  constructor() {}

  filtrar(parametros: any): Observable<any[]> {
    let params = new HttpParams();
    for (const prop in parametros) {
      if (parametros.hasOwnProperty(prop)) {
        params = params.append(prop, parametros[prop]);
      }
    }

    return this.http.get<any[]>(`${_SERVER}/api/administrador/filtrar/0/5`, {
      params: params
    });
  }

  guardar(datos: TipoAdministrador, id?: number): Observable<TipoAdministrador> {
    delete datos.id; // eliminamos el id autoincremental
    if (id) {
      return this.http.put<TipoAdministrador>(`${_SERVER}/api/administrador/${id}`, datos);
    }
    return this.http.post<TipoAdministrador>(`${_SERVER}/api/administrador`, datos);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${_SERVER}/api/administrador/${id}`).pipe(
      retry(1),
      map(() => true),
      catchError(this.handleError)
    );
  }

  buscar(id: number): Observable<TipoAdministrador> {
    return this.http.get<TipoAdministrador>(`${_SERVER}/api/administrador/${id}`);
  }

  private handleError(error: any) {
    return throwError(() => error.status);
  }
}