import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TipoCaso } from '../models/TipoCaso';

const _SERVER = environment.servidor;

@Injectable({
  providedIn: 'root'
})
export class CasoService {
  private readonly http = inject(HttpClient);

  constructor() {}

  filtrar(parametros: any, inicio: number = 0, cantidad: number = 5): Observable<TipoCaso[]> {
  let params = new HttpParams();
  for (const prop in parametros) {
    if (parametros.hasOwnProperty(prop) && parametros[prop] !== '') {
      params = params.append(prop, parametros[prop]);
    }
  }

  return this.http.get<TipoCaso[]>(`${_SERVER}/api/caso/filtrar/${inicio}/${cantidad}`, {
    params: params
  });
}


  guardar(datos: any, id?: number): Observable<any> {
    if (id) {
      return this.http.put<any>(`${_SERVER}/api/caso/${id}`, datos);
    }
    return this.http.post<any>(`${_SERVER}/api/caso`, datos);
  }

  eliminar(id: number): Observable<boolean> {
    return this.http.delete(`${_SERVER}/api/caso/${id}`).pipe(
      retry(1),
      map(() => true),
      catchError(this.handleError)
    );
  }

  buscar(id: number): Observable<TipoCaso> {
    return this.http.get<TipoCaso>(`${_SERVER}/api/caso/${id}`);
  }

  cambiarEstado(payload: {
    idCaso: number;
    idResponsable: string;
    nuevo_estado: number;
    descripcion_cambio: string;
  }): Observable<any> {
    return this.http.post(`${_SERVER}/api/caso/cambiarEstado`, payload);
  }

  private handleError(error: any) {
    return throwError(() => error.status);
  }
}