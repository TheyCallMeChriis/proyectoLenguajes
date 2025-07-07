import {
  AfterViewInit,
  Component,
  inject,
  signal,
  ViewChild
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FrmTecnico } from '../forms/frm-tecnico/frm-tecnico';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { TecnicoService } from '../../shared/services/tecnico-service';
import { UsuarioService } from '../../shared/services/usuario-service';
import { PrintService } from '../../shared/services/print-service';
import { AuthService } from '../../shared/services/auth-service';
import { TipoTecnico } from '../../shared/models/TipoTecnico';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tecnico',
  imports: [
    MatCardModule, MatTableModule, MatIconModule, MatExpansionModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule, CommonModule
  ],
  templateUrl: './tecnico.html',
  styleUrls: ['./tecnico.css'],
})
export class Tecnico implements AfterViewInit {
  private readonly tecnicoSrv = inject(TecnicoService);
  private readonly usuarioSrv = inject(UsuarioService);
  private readonly dialogo = inject(MatDialog);
  private readonly printSrv = inject(PrintService);
  public readonly srvAuth = inject(AuthService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  panelOpenState = signal(false);
  columnas: string[] = [
    'idTecnico',
    'nombre',
    'apellido1',
    'apellido2',
    'celular',
    'correo',
    'botonera',
  ];
  dataSource = signal(new MatTableDataSource<TipoTecnico>());
  filtro: any;

  mostrarDialogo(titulo: string, datos?: TipoTecnico) {
    const dialogoRef = this.dialogo.open(FrmTecnico, {
      width: '50vw',
      maxWidth: '35rem',
      data: {
        title: titulo,
        datos: datos,
      },
      disableClose: true,
    });

    dialogoRef.afterClosed().subscribe({
      next: (res) => {
        if (res !== false) this.resetearFiltro();
      },
    });
  }
  onInfo(id: number) {
    // Implementar
  }

  resetearFiltro() {
    this.filtro = { idTecnico: '', nombre: '', apellido1: '', correo: '' };
    this.filtrar();
  }

  filtrar() {
    this.tecnicoSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        this.dataSource().data = data;
        this.dataSource().paginator = this.paginator;
      },
      error: (err) => console.error(err),
    });
  }

  limpiar() {
    this.resetearFiltro();
    (document.querySelector('#fidTecnico') as HTMLInputElement).value = '';
    (document.querySelector('#fnombre') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido1') as HTMLInputElement).value = '';
    (document.querySelector('#fcorreo') as HTMLInputElement).value = '';
  }

  onNuevo() {
    this.mostrarDialogo('Nuevo Técnico');
  }

  onEditar(id: number) {
    this.tecnicoSrv.buscar(id).subscribe({
      next: (data) => this.mostrarDialogo('Editar Técnico', data),
    });
  }

  onEliminar(id: number) {
    const dialogoRef = this.dialogo.open(DialogoGeneral, {
      data: {
        texto: `¿Está seguro de eliminar el técnico con ID interno ${id}?`,
        icono: 'question_mark',
        textoAceptar: 'Sí',
        textoCancelar: 'No',
      },
    });

    dialogoRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.tecnicoSrv.eliminar(id).subscribe(() => {
          this.dialogo.open(DialogoGeneral, {
            data: {
              texto: `Técnico con ID ${id} eliminado correctamente`,
              icono: 'check',
              textoAceptar: 'Aceptar',
            },
          });
          this.resetearFiltro();
        });
      }
    });
  }

  onResetearPassw(id: number) {
    this.tecnicoSrv.buscar(id).subscribe({
      next: (data) => {
        const dialogoRef = this.dialogo.open(DialogoGeneral, {
          data: {
            texto: `¿Desea resetear la contraseña de ${data.nombre}?`,
            icono: 'question_mark',
            textoAceptar: 'Sí',
            textoCancelar: 'No',
          },
        });

        dialogoRef.afterClosed().subscribe((result) => {
          if (result === true) {
            this.usuarioSrv.resetearPassw(data.idTecnico).subscribe(() => {
              this.dialogo.open(DialogoGeneral, {
                data: {
                  texto: 'Contraseña restablecida',
                  icono: 'check',
                  textoAceptar: 'Aceptar',
                },
              });
            });
          }
        });
      },
    });
  }
  onFiltroChange(f: any) {
    this.filtro = f;
    this.filtrar();
  }

  onImprimir() {
    const encabezado = [
      'ID Técnico',
      'Nombre',
      'Teléfono',
      'Celular',
      'Correo',
    ];

    this.tecnicoSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        const cuerpo = Object(data).map((Obj: any) => [
          Obj.idTecnico,
          `${Obj.nombre} ${Obj.apellido1} ${Obj.apellido2}`,
          Obj.telefono,
          Obj.celular,
          Obj.correo,
        ]);
        this.printSrv.print(encabezado, cuerpo, 'Listado de Técnicos', true);
      },
    });
  }

  ngAfterViewInit(): void {
    this.resetearFiltro();
  }
}
