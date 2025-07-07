export interface TipoCaso {
  id: number;
  descripcion: string;
  fechaEntrada: string;
  fechaSalida: string | null;
  nombre_cliente: string;
  apellido1_cliente: string;
  marca_artefacto: string;
  modelo_artefacto: string;
  nombre_tecnico: string;
  apellido1_tecnico: string;
  estado_actual: string;
}
export interface IToken{
    token : string,
    tkRef : string;
}