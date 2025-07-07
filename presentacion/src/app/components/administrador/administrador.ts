import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { TipoAdministrador } from '../../shared/models/TipoAdministrador';
import { AdministradorService } from '../../shared/services/administrador-service';
import { UsuarioService } from '../../shared/services/usuario-service';
import { PrintService } from '../../shared/services/print-service';
import { AuthService } from '../../shared/services/auth-service';

import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FrmAdministrador } from '../forms/frm-administrador/frm-administrador';
import { DialogoGeneral } from '../forms/dialogo-general/dialogo-general';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [
    MatCardModule, MatTableModule, MatIconModule, MatExpansionModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule
  ],
  templateUrl: './administrador.html',
  styleUrls: ['./administrador.css']
})
export class Administrador implements AfterViewInit {
  private readonly administradorSrv = inject(AdministradorService);
  private readonly usuarioSrv = inject(UsuarioService);
  private readonly dialogo = inject(MatDialog);
  private readonly printSrv = inject(PrintService);
  public readonly srvAuth = inject(AuthService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  panelOpenState = signal(false);
  columnas: string[] = ['idAdministrador', 'nombre', 'apellido1', 'apellido2', 'celular', 'correo', 'botonera'];
  dataSource = signal(new MatTableDataSource<TipoAdministrador>());
  filtro: any;

  mostrarDialogo(titulo: string, datos?: TipoAdministrador) {
    const dialogoRef = this.dialogo.open(FrmAdministrador, {
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
    this.filtro = { idAdministrador: '', nombre: '', apellido1: '', apellido2: '' };
    this.filtrar();
  }

  onInfo(id: number) {
    // Implementar si se necesita
  }

  filtrar() {
    this.administradorSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        this.dataSource().data = data;
        this.dataSource().paginator = this.paginator;
      },
      error: (err) => console.error(err)
    });
  }

  limpiar() {
    this.resetearFiltro();
    (document.querySelector('#fidAdministrador') as HTMLInputElement).value = '';
    (document.querySelector('#fnombre') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido1') as HTMLInputElement).value = '';
    (document.querySelector('#fapellido2') as HTMLInputElement).value = '';
  }

  onNuevo() {
    this.mostrarDialogo('Nuevo Administrador');
  }

  onEditar(id: number) {
    this.administradorSrv.buscar(id).subscribe({
      next: (data) => {
        this.mostrarDialogo('Editar Administrador', data);
      }
    });
  }

  onEliminar(id: number) {
    const dialogoRef = this.dialogo.open(DialogoGeneral, {
      data: {
        texto: `¿Está seguro de eliminar al administrador con id ${id}?`,
        icono: 'question_mark',
        textoAceptar: 'Sí',
        textoCancelar: 'No',
      }
    });

    dialogoRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.administradorSrv.eliminar(id).subscribe(() => {
          this.dialogo.open(DialogoGeneral, {
            data: {
              texto: `Administrador con id ${id} eliminado correctamente`,
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
  onResetearPassw(id: number) {
    this.administradorSrv.buscar(id).subscribe({
      next: (data) => {
        const dialogoRef = this.dialogo.open(DialogoGeneral, {
          data: {
            texto: `¿Desea resetear la contraseña de ${data.nombre}?`,
            icono: 'question_mark',
            textoAceptar: 'Sí',
            textoCancelar: 'No',
          }
        });

        dialogoRef.afterClosed().subscribe(result => {
          if (result === true) {
            this.usuarioSrv.resetearPassw(data.idAdministrador).subscribe(() => {
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
    const encabezado = ['ID Administrador', 'Nombre', 'Teléfono', 'Celular', 'Correo'];

    this.administradorSrv.filtrar(this.filtro).subscribe({
      next: (data) => {
        const cuerpo = Object(data).map((Obj: any) => {
          return [
            Obj.idAdministrador,
            `${Obj.nombre} ${Obj.apellido1} ${Obj.apellido2}`,
            Obj.telefono,
            Obj.celular,
            Obj.correo
          ];
        });

        this.printSrv.print(encabezado, cuerpo, 'Listado de Administradores', true);
      }
    });
  }

  ngAfterViewInit(): void {
    this.filtro = { idAdministrador: '', nombre: '', apellido1: '', apellido2: '' };
    this.filtrar();
  }
}