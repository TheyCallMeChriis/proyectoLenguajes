export interface TipoCliente{
    id?: number;
    idCliente: string;
    nombre: string;
    apellido1: string;
    apellido2: string;
    telefono: string;
    celular: string;
    direccion: string;
    correo: string;
    fechaIngreso: string
}
export interface TipoCaso {
  id?: number;
  idTecnico: string;
  idCreador: string;
  idArtefacto: string; // Ahora contiene directamente la serie del artefacto
  descripcion: string;
  fechaEntrada: string;
  fechaSalida?: string;
  // Campos adicionales del backend para casos específicos
  codigoArtefacto?: string; // Serie del artefacto (para casos que usen JOIN)
  estadoActual?: number; // Estado numérico actual
  estadoTexto?: string; // Estado en texto legible
  ultimaActualizacion?: string; // Fecha de última actualización de estado
}

export interface TipoHistorial {
  id?: number;
  idCaso: number;
  idResponsable: string;
  estado: number;
  fechaCambio: string;
  descripcion: string;
}

export interface IToken{
    token : string,
    tkRef : string;
}