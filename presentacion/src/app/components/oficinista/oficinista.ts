import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { TipoOficinista } from '../../shared/models/TipoOficinista';
import { OficinistaService } from '../../shared/services/oficinista-service';

import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FrmOficinista } from '../forms/frm-oficinista/frm-oficinista';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { UsuarioService } from '../../shared/services/usuario-service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { PrintService } from '../../shared/services/print-service';
import { AuthService } from '../../shared/services/auth-service';

@Component({
  selector: 'app-oficinista',
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
  templateUrl: './oficinista.html',
  styleUrls: ['./oficinista.css']
})
export class Oficinista implements AfterViewInit {
  private readonly oficinistaSrv = inject(OficinistaService);
  private readonly usuarioSrv = inject(UsuarioService);
  private readonly dialogo = inject(MatDialog);
  private readonly printSrv = inject(PrintService);
  public readonly srvAuth = inject(AuthService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  panelOpenState = signal(false);
  columnas: string[] = [
    'idOficinista', 'nombre', 'apellido1', 'apellido2', 'celular', 'correo', 'botonera'
  ];
  dataSource = signal(new MatTableDataSource<TipoOficinista>());
  filtro: any;

  mostrarDialogo(titulo: string, datos?: TipoOficinista) {
    const dialogoRef = this.dialogo.open(FrmOficinista, {
      width: '50vw',
      maxWidth: '35rem',
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
    this.filtro = {
      idOficinista: '',
      nombre: '',
      apellido1: '',
      apellido2: ''
    };
    this.filtrar();
  }

  filtrar() {
    this.oficinistaSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        this.dataSource().data = data;
        this.dataSource().paginator = this.paginator; // conectar paginator
      },
      error: (err) => console.error(err)
    });
  }

  limpiar() {
    this.resetearFiltro();
    (document.querySelector('#fidOficinista') as HTMLInputElement).value = '';
    (document.querySelector('#fnombre') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido1') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido2') as HTMLInputElement).value = '';
  }

  onNuevo() {
    this.mostrarDialogo('Nuevo Oficinista');
  }

  onEditar(id: number) {
    this.oficinistaSrv.buscar(id).subscribe({
      next: (data) => {
        this.mostrarDialogo('Editar Oficinista', data);
      }
    });
  }

  onEliminar(id: number) {
    const dialogoRef = this.dialogo.open(DialogoGeneral, {
      data: {
        texto: `¿Está seguro de eliminar el oficinista con id ${id}?`,
        icono: 'question_mark',
        textoAceptar: 'Sí',
        textoCancelar: 'No'
      }
    });

    dialogoRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.oficinistaSrv.eliminar(id).subscribe(() => {
          this.dialogo.open(DialogoGeneral, {
            data: {
              texto: `Oficinista con id ${id} eliminado correctamente`,
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
    // Implementar si se necesita
  }

  onFiltroChange(f: any) {
    this.filtro = f;
    this.filtrar();
  }

  onResetearPassw(id: number) {
    this.oficinistaSrv.buscar(id).subscribe({
      next: (data) => {
        const dialogoRef = this.dialogo.open(DialogoGeneral, {
          data: {
            texto: `¿Desea resetear la contraseña de ${data.nombre}?`,
            icono: 'question_mark',
            textoAceptar: 'Sí',
            textoCancelar: 'No'
          }
        });

        dialogoRef.afterClosed().subscribe(result => {
          if (result === true) {
            this.usuarioSrv.resetearPassw(data.idOficinista).subscribe(() => {
              this.dialogo.open(DialogoGeneral, {
                data: {
                  texto: 'Contraseña restablecida',
                  icono: 'check',
                  textoAceptar: 'Aceptar'
                }
              });
            });
          }
        });
      }
    });
  }

  onImprimir() {
    const encabezado = [
      'ID Oficinista',
      'Nombre',
      'Teléfono',
      'Celular',
      'Correo'
    ];

    this.oficinistaSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        const cuerpo = Object(data).map((obj: any) => {
          return [
            obj.idOficinista,
            `${obj.nombre} ${obj.apellido1} ${obj.apellido2}`,
            obj.telefono,
            obj.celular,
            obj.correo
          ];
        });

        this.printSrv.print(encabezado, cuerpo, 'Listado de Oficinistas', true);
      }
    });
  }

  ngAfterViewInit(): void {
    this.filtro = {
      idOficinista: '',
      nombre: '',
      apellido1: '',
      apellido2: ''
    };
    this.filtrar();
  }
}