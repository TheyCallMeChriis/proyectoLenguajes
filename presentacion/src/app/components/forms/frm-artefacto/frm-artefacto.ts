import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ArtefactoService } from '../../../shared/services/artefacto-service';
import { DialogoGeneral } from '../dialogo-general/dialogo-general';

@Component({
  selector: 'app-frm-artefacto',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatInputModule, ReactiveFormsModule, MatFormFieldModule],
  templateUrl: './frm-artefacto.html',
  styleUrl: './frm-artefacto.css'
})
export class FrmArtefacto implements OnInit {
  titulo!: string;
  srvArtefacto = inject(ArtefactoService);
  private data = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);
  dialogRef = inject(MatDialogRef<FrmArtefacto>);
  private builder = inject(FormBuilder);
  myForm: FormGroup;

  constructor() {
    this.myForm = this.builder.group({
      id: [0],
      idCliente: [null, [Validators.required]],
      serie: ['', [Validators.required, Validators.maxLength(15)]],
      modelo: ['', [Validators.required, Validators.maxLength(15)]],
      marca: ['', [Validators.required, Validators.maxLength(15)]],
      categoria: ['', [Validators.required, Validators.maxLength(15)]],
      descripcion: ['', [Validators.required, Validators.maxLength(50)]]
    });
  }

  get F() {
    return this.myForm.controls;
  }

  onGuardar() {
    const datos = this.myForm.value;
    if (datos.id === 0) {
      this.srvArtefacto.guardar(datos).subscribe({
        complete: () => {
          this.dialog.open(DialogoGeneral, {
            data: {
              texto: 'Artefacto creado correctamente',
              titulo: 'Artefacto creado',
              icono: 'check',
              textoAceptar: 'Aceptar'
            }
          });
          this.dialogRef.close();
        }
      });
    } else {
      this.srvArtefacto.guardar(datos, datos.id).subscribe({
        complete: () => {
          this.dialog.open(DialogoGeneral, {
            data: {
              texto: 'Artefacto actualizado correctamente',
              titulo: 'Artefacto actualizado',
              icono: 'check',
              textoAceptar: 'Aceptar'
            }
          });
          this.dialogRef.close();
        }
      });
    }
  }

  ngOnInit() {
    this.titulo = this.data.title;
    if (this.data.datos) {
      this.myForm.setValue({
        id: this.data.datos.id,
        idCliente: this.data.datos.idCliente,
        serie: this.data.datos.serie,
        modelo: this.data.datos.modelo,
        marca: this.data.datos.marca,
        categoria: this.data.datos.categoria,
        descripcion: this.data.datos.descripcion
      });
    }
  }
}