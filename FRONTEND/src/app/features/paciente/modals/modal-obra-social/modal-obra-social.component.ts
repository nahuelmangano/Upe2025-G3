import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ObraSocial } from '@features/maestros/interfaces/obra-social';
import { ObraSocialService } from '@features/maestros/services/obra-social.service';
import { ResponseApi } from '@core/interfaces/response-api';

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

    // Convertimos a booleano controlando valores numéricos y strings ("0"/"1")
    const activoInicial = datosObraSocial?.activo !== undefined
      ? Number(datosObraSocial.activo) === 1
      : true;

    this.formularioObraSocial = this.fb.group({
      id: [datosObraSocial?.id || 0],
      nombre: [datosObraSocial?.nombre || "", Validators.required],
      activo: [activoInicial] // MatSlideToggle trabaja con booleanos
    });
  }

  guardarEditarObraSocial() {
    if (this.formularioObraSocial.invalid) {
      return;
    }

    const formValue = this.formularioObraSocial.value;
    const obraSocial: ObraSocial = {
      id: formValue.id,
      nombre: formValue.nombre,
      activo: formValue.activo ? 1 : 0
    };
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
