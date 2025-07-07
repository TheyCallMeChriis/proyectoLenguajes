import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { TipoCaso } from '../../shared/models/TipoCaso';
import { CasoService } from '../../shared/services/caso-service';
import { PrintService } from '../../shared/services/print-service';
import { AuthService } from '../../shared/services/auth-service';

import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FrmCaso } from '../forms/frm-caso/frm-caso';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-caso',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './caso.html',
  styleUrls: ['./caso.css']
})
export class Caso implements AfterViewInit {
  private readonly casoSrv = inject(CasoService);
  private readonly printSrv = inject(PrintService);
  public readonly srvAuth = inject(AuthService);
  private readonly dialogo = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  panelOpenState = signal(false);
  columnas: string[] = [
    'id', 'descripcion', 'fechaEntrada', 'fechaSalida',
    'nombre_cliente', 'marca_artefacto', 'modelo_artefacto',
    'estado_actual', 'botonera'
  ];
  dataSource = signal(new MatTableDataSource<TipoCaso>());

  // ✅ Aquí está el cambio: inicialización del filtro
  filtro: any = { id: '', nombre_cliente: '', marca_artefacto: '', estado_actual: '' };

  mostrarDialogo(titulo: string, datos?: TipoCaso) {
    const dialogoRef = this.dialogo.open(FrmCaso, {
      width: '60vw',
      maxWidth: '40rem',
      data: {
        title: titulo,
        datos: datos
      },
      disableClose: true
    });

    dialogoRef.afterClosed().subscribe({
      next: (res) => {
        if (res !== false) {
          this.resetearFiltro();
        }
      }
    });
  }

  resetearFiltro() {
    this.filtro = { id: '', nombre_cliente: '', marca_artefacto: '', estado_actual: '' };
    this.filtrar();
  }

  limpiar() {
    this.resetearFiltro();
    (document.querySelector('#fid') as HTMLInputElement).value = '';
    (document.querySelector('#fnombre') as HTMLInputElement).value = '';
    (document.querySelector('#fmarca') as HTMLInputElement).value = '';
    (document.querySelector('#festado') as HTMLInputElement).value = '';
  }

  filtrar() {
    this.casoSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        this.dataSource().data = data;
        this.dataSource().paginator = this.paginator;
      },
      error: (err) => console.error(err)
    });
  }

  onNuevo() {
    this.mostrarDialogo('Nuevo Caso');
  }

  onEditar(id: number) {
    this.casoSrv.buscar(id).subscribe({
      next: (data) => {
        this.mostrarDialogo('Editar Caso', data);
      }
    });
  }

  onEliminar(id: number) {
    const dialogoRef = this.dialogo.open(DialogoGeneral, {
      data: {
        texto: `¿Está seguro de eliminar el caso con id ${id}?`,
        icono: 'question_mark',
        textoAceptar: 'Sí',
        textoCancelar: 'No',
      }
    });

    dialogoRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.casoSrv.eliminar(id).subscribe(() => {
          this.dialogo.open(DialogoGeneral, {
            data: {
              texto: `Caso con id ${id} eliminado correctamente`,
              icono: 'check',
              textoAceptar: 'Aceptar'
            },
          });
          this.resetearFiltro();
        });
      }
    });
  }

  onFiltroChange(f: any) {
    this.filtro = f;
    this.filtrar();
  }

  onImprimir() {
    const encabezado = ['ID', 'Descripción', 'Entrada', 'Cliente', 'Marca', 'Modelo', 'Estado'];

    this.casoSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        const cuerpo = data.map((obj: any) => [
          obj.id,
          obj.descripcion,
          obj.fechaEntrada,
          `${obj.nombre_cliente} ${obj.apellido1_cliente}`,
          obj.marca_artefacto,
          obj.modelo_artefacto,
          obj.estado_actual
        ]);

        this.printSrv.print(encabezado, cuerpo, 'Listado de Casos', true);
      }
    });
  }

  onInfo(id: number) {
    // Puedes abrir otra vista o diálogo con historial, si lo deseas
  }

  ngAfterViewInit(): void {
    this.resetearFiltro();
  }
}
