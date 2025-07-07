export interface TipoArtefacto {
  id?: number;
  idCliente: number;
  serie: string;
  modelo: string;
  marca: string;
  categoria: string;
  descripcion: string;
}
export interface IToken{
    token : string,
    tkRef : string;
}