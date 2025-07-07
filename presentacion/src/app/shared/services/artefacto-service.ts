import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TipoArtefacto } from '../models/TipoArtefacto';

const _SERVER = environment.servidor;

@Injectable({
  providedIn: 'root'
})
export class ArtefactoService {
  private readonly http = inject(HttpClient);
  constructor() {}

  filtrar(parametros: any) {
    let paranms = new HttpParams();
    for (const prop in parametros) {
      paranms = paranms.append(prop, parametros[prop]);
    }
    return this.http.get<any>(`${_SERVER}/api/artefacto/filtrar/0/5`, {
      params: paranms,
    });
  }

  guardar(datos: TipoArtefacto, id?: number): Observable<TipoArtefacto> {
    delete datos.id;
    if (id) {
      return this.http.put<TipoArtefacto>(`${_SERVER}/api/artefacto/${id}`, datos);
    }
    return this.http.post<TipoArtefacto>(`${_SERVER}/api/artefacto`, datos);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${_SERVER}/api/artefacto/${id}`).pipe(
      retry(1),
      map(() => true),
      catchError(this.handleError)
    );
  }

  buscar(id: number): Observable<TipoArtefacto> {
    return this.http.get<TipoArtefacto>(`${_SERVER}/api/artefacto/${id}`);
  }

  private handleError(error: any) {
    return throwError(() => error.status);
  }
}