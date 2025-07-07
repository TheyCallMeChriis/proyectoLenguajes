import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TipoTecnico } from '../models/TipoTecnico';

const _SERVER = environment.servidor;

@Injectable({
  providedIn: 'root'
})
export class TecnicoService {
  private readonly http = inject(HttpClient);
  constructor() {}

  filtrar(parametros : any) {
      let paranms = new HttpParams;
      for (const prop in parametros) {
          paranms = paranms.append(prop, parametros[prop])
      }
      return this.http.get<any>(`${_SERVER}/api/tecnico/filtrar/0/5`, 
          { params : paranms }
        );  
    }

  guardar(datos: TipoTecnico, id?: number): Observable<TipoTecnico> {
    delete datos.id; // Se elimina el id interno autoincremental
    if (id) {
      return this.http.put<TipoTecnico>(`${_SERVER}/api/tecnico/${id}`, datos);
    }
    return this.http.post<TipoTecnico>(`${_SERVER}/api/tecnico`, datos);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${_SERVER}/api/tecnico/${id}`).pipe(
      retry(1),
      map(() => true),
      catchError(this.handleError)
    );
  }

  buscar(id: number): Observable<TipoTecnico> {
    return this.http.get<TipoTecnico>(`${_SERVER}/api/tecnico/${id}`);
  }

  private handleError(error: any) {
    return throwError(() => error.status);
  }
}