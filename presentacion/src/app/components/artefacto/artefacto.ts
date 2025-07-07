import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

import { TipoArtefacto } from '../../shared/models/TipoArtefacto';
import { ArtefactoService } from '../../shared/services/artefacto-service';
import { UsuarioService } from '../../shared/services/usuario-service';
import { PrintService } from '../../shared/services/print-service';
import { AuthService } from '../../shared/services/auth-service';

import { FrmArtefacto } from '../forms/frm-artefacto/frm-artefacto';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';

@Component({
  selector: 'app-artefacto',
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
  templateUrl: './artefacto.html',
  styleUrls: ['./artefacto.css']
})
export class Artefacto implements AfterViewInit {
  private readonly artefactoSrv = inject(ArtefactoService);
  private readonly usuarioSrv = inject(UsuarioService);
  private readonly dialogo = inject(MatDialog);
  private readonly printSrv = inject(PrintService);
  public readonly srvAuth = inject(AuthService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  panelOpenState = signal(false);
  columnas: string[] = ['serie', 'modelo', 'marca', 'categoria', 'descripcion', 'botonera'];
  dataSource = signal(new MatTableDataSource<TipoArtefacto>());
  filtro: any;

  mostrarDialogo(titulo: string, datos?: TipoArtefacto) {
    const dialogoRef = this.dialogo.open(FrmArtefacto, {
      width: '50vw',
      maxWidth: '35rem',
      data: { title: titulo, datos: datos },
      disableClose: true
    });

    dialogoRef.afterClosed().subscribe({
      next: (res) => {
        if (res !== false) this.resetearFiltro();
      }
    });
  }

  resetearFiltro() {
    this.filtro = { serie: '', modelo: '', marca: '', categoria: '' };
    this.filtrar();
  }

  filtrar() {
    this.artefactoSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        this.dataSource().data = data;
        this.dataSource().paginator = this.paginator;
      },
      error: (err) => console.error(err)
    });
  }

  limpiar() {
    this.resetearFiltro();
    (document.querySelector('#fserie') as HTMLInputElement).value = '';
    (document.querySelector('#fmodelo') as HTMLInputElement).value = '';
    (document.querySelector('#fmarca') as HTMLInputElement).value = '';
    (document.querySelector('#fcategoria') as HTMLInputElement).value = '';
  }

  onNuevo() {
    this.mostrarDialogo('Nuevo Artefacto');
  }

  onEditar(id: number) {
    this.artefactoSrv.buscar(id).subscribe({
      next: (data) => this.mostrarDialogo('Editar Artefacto', data)
    });
  }

  onEliminar(id: number) {
    const dialogoRef = this.dialogo.open(DialogoGeneral, {
      data: {
        texto: `¿Está seguro de eliminar el artefacto con id ${id}?`,
        icono: 'question_mark',
        textoAceptar: 'Sí',
        textoCancelar: 'No'
      }
    });

    dialogoRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.artefactoSrv.eliminar(id).subscribe(() => {
          this.dialogo.open(DialogoGeneral, {
            data: {
              texto: `Artefacto con id ${id} eliminado correctamente`,
              icono: 'check',
              textoAceptar: 'Aceptar'
            }
          });
          this.resetearFiltro();
        });
      }
    });
  }

  onInfo(id: number) {
    // Puedes implementar detalles adicionales aquí si lo deseas
  }

  onFiltroChange(f: any) {
    this.filtro = f;
    this.filtrar();
  }

  onImprimir() {
    const encabezado = ['Serie', 'Modelo', 'Marca', 'Categoría', 'Descripción'];

    this.artefactoSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        const cuerpo = data.map((a: any) => [
          a.serie,
          a.modelo,
          a.marca,
          a.categoria,
          a.descripcion
        ]);
        this.printSrv.print(encabezado, cuerpo, 'Listado de Artefactos', true);
      }
    });
  }

  ngAfterViewInit(): void {
    this.resetearFiltro();
  }
}