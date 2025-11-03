import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ObraSocial } from 'src/app/interfaces/obra-social';
import { ObraSocialService } from 'src/app/services/obra-social.service';
import { ResponseApi } from 'src/app/interfaces/response-api';

import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-obra-social',
  templateUrl: './modal-obra-social.component.html',
  styleUrls: ['./modal-obra-social.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule
  ]
})
export class ModalObraSocialComponent {
  formularioObraSocial: FormGroup;
  tituloAccion: string;
  botonAccion: string;

  constructor(
    private modalActual: MatDialogRef<ModalObraSocialComponent>,
    @Inject(MAT_DIALOG_DATA) public datosObraSocial: ObraSocial,
    private fb: FormBuilder,
    private _obraSocialServicio: ObraSocialService
  ) {
    this.tituloAccion = datosObraSocial ? "Editar Obra Social" : "Agregar Obra Social";
    this.botonAccion = datosObraSocial ? "Actualizar" : "Guardar";

    this.formularioObraSocial = this.fb.group({
      id: [datosObraSocial?.id || 0],
      nombre: [datosObraSocial?.nombre || "", Validators.required],
      activo: [datosObraSocial?.activo ?? 1] // Activo por defecto
    });
  }

  guardarEditarObraSocial() {
    if (this.formularioObraSocial.invalid) {
      return;
    }

    const obraSocial: ObraSocial = this.formularioObraSocial.value;
    const accion = this.datosObraSocial ? this._obraSocialServicio.editar(obraSocial) : this._obraSocialServicio.crear(obraSocial);

    accion.subscribe({
      next: (data: ResponseApi) => {
        if (data.estado) {
          this.modalActual.close(data.valor);
        }
      },
      error: () => {
        console.error("Error al guardar la obra social");
      }
    });
  }
}