import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TipoCaso, TipoHistorial } from '../models/interface';
import { AuthService } from './auth-service';

const _SERVER = environment.servidor;

@Injectable({
  providedIn: 'root'
})
export class CasoService {
  private api = `${environment.servidor}/caso`;
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  
  constructor() { }

  filtrar(parametros: any): Observable<TipoCaso[]> {
    return this.http.get<TipoCaso[]>(`${environment.servidor}/caso/filtrar`, {
      params: parametros
    });
  }


  filtrarPorRol(parametros: any): Observable<TipoCaso[]> {
  const usuario = this.authService.userActualDos;
  console.log('Usuario actual para filtrado:', usuario); // <-- AÑADE ESTO

  switch (usuario.rol) {
    case 1:
    case 2:
      return this.filtrar(parametros);
    case 3:
      return this.buscarPorTecnico(usuario.idUsuario, parametros);
    case 4:
      return this.buscarPorCliente(usuario.idUsuario, parametros);
    default:
      return throwError(() => new Error('Usuario sin permisos para ver casos'));
  }
}

  guardar(datos: TipoCaso, id?: number): Observable<TipoCaso> {
    const datosCopia = { ...datos };
    delete datosCopia.id;
    if (id) {
      return this.http.put<any>(`${_SERVER}/api/caso/${id}`, datosCopia);
    }
    return this.http.post<any>(`${_SERVER}/api/caso`, datosCopia);
  }

  eliminar(id: number) {
    return this.http.delete<any>(`${_SERVER}/api/caso/${id}`)
      .pipe(
        retry(1),
        map(() => true),
        catchError(this.handleError)
      );
  }

  buscar(id: number) {
    return this.http.get<TipoCaso>(`${_SERVER}/api/caso/${id}`);
  }

  buscarPorCliente(idCliente: string, parametros?: any) {
    let params = new HttpParams();
    
    // Solo agregar parámetros que tengan valor
    if (parametros) {
      for (const prop in parametros) {
        if (parametros[prop] !== '' && parametros[prop] !== null && parametros[prop] !== undefined) {
          params = params.append(prop, parametros[prop]);
        }
      }
    }
    
    return this.http.get<TipoCaso[]>(`${_SERVER}/api/caso/cliente/${idCliente}`, { params: params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  buscarPorTecnico(idTecnico: string, parametros?: any) {
    let params = new HttpParams();
    
    // Solo agregar parámetros que tengan valor
    if (parametros) {
      for (const prop in parametros) {
        if (parametros[prop] !== '' && parametros[prop] !== null && parametros[prop] !== undefined) {
          params = params.append(prop, parametros[prop]);
        }
      }
    }
    
    return this.http.get<TipoCaso[]>(`${_SERVER}/api/caso/tecnico/${idTecnico}`, { params: params });
  }

  historial(idCaso: number) {
    return this.http.get<TipoHistorial[]>(`${_SERVER}/api/caso/historial/${idCaso}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  cambiarEstado(idCaso: number, payload: { estado: number, idResponsable: string, descripcion: string }) {
    return this.http.post<any>(`${_SERVER}/api/caso/estado/${idCaso}`, payload);
  }

  consultarEstado(idCaso: number) {
    return this.http.get<any>(`${_SERVER}/api/caso/estado/${idCaso}`);
  }

  /**
   * Verifica si el usuario actual puede crear casos
   */
  puedeCrear(): boolean {
    const usuario = this.authService.userActualDos;
    return [1, 2].includes(usuario.rol); // Todos los roles pueden crear casos
  }

  /**
   * Verifica si el usuario actual puede editar un caso específico
   */
  puedeEditar(caso: TipoCaso): boolean {
    const usuario = this.authService.userActualDos;
    
    switch (usuario.rol) {
      case 1: // Admin
      case 2: // Oficinista
        return true; // Pueden editar cualquier caso
        
      case 3: // Técnico
      case 4: // Cliente
       
        
      default:
        return false;
    }
  }

  /**
   * Verifica si el usuario actual puede eliminar un caso específico
   */
  puedeEliminar(caso: TipoCaso): boolean {
    const usuario = this.authService.userActualDos;
    
    switch (usuario.rol) {
      case 1: // Admin
      case 2: // Oficinista
        return true; 
  
      case 3: // Técnico
      case 4: // Cliente
      default:
        return false; // Otros roles no pueden eliminar
    }
  }

  /**
   * Verifica si el usuario actual puede cambiar el estado de un caso
   */
  puedeCambiarEstado(caso: TipoCaso): boolean {
    const usuario = this.authService.userActualDos;
    
    switch (usuario.rol) {
      case 1: // Admin
      case 2: // Oficinista
        return true; // Pueden cambiar estado de cualquier caso
        
      case 3: // Técnico
        return caso.idTecnico === usuario.idUsuario; // Solo sus casos asignados
        
      case 4: // Cliente
      default:
        return false; // Clientes no pueden cambiar estados
    }
  }

  private handleError(error: any) {
    return throwError(() => {
      console.error('Error en CasoService:', error);
      return error;
    });
  }
}
