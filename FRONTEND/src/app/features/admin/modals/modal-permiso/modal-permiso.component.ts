import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilidadService } from '@core/services/utilidad.service';
import { SHARED_IMPORTS } from '@shared/shared-imports';
import { ResponseApi } from '@core/interfaces/response-api';
import { Rol } from '@core/interfaces/rol';
import { Permiso } from '@core/interfaces/permiso';
import { PermisoService } from '@core/services/permiso.service';

@Component({
  selector: 'app-modal-permiso',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './modal-permiso.component.html',
  styleUrl: './modal-permiso.component.css'
})
export class ModalPermisoComponent {
  formularioPermiso: FormGroup;
  tituloAccion = "Crear";
  botonAccion = "Guardar";
  listaPermisos: Permiso[] = [];

  constructor(
    private modalActual: MatDialogRef<ModalPermisoComponent>,
    @Inject(MAT_DIALOG_DATA) public datosPermiso: Permiso,
    private fb: FormBuilder,
    private _utilidadServicio: UtilidadService,
    private _permisoServicio: PermisoService
  ) {
    this.formularioPermiso = this.fb.group({
      nombre: ["", Validators.required],
      descripcion: ["", Validators.required],
      activo: [true]
    });

    if (this.datosPermiso != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
    }

    this._permisoServicio.lista().subscribe({
      next: (data) => {
        if (data.estado) {
          this.listaPermisos = data.valor;
          console.log(data.valor);

        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron registros", "Opps!");
        }
      },
      error: () => {
        this._utilidadServicio.mostrarAlerta("No se pudo cargar la lista de permisos", "Opps!");
      }
    });
  }

  ngOnInit(): void {
    if (this.datosPermiso != null) {
      this.formularioPermiso.patchValue({
        id: this.datosPermiso.id,
        nombre: this.datosPermiso.nombre,
        descripcion: this.datosPermiso.descripcion,
        activo: this.datosPermiso.activo
      });
    }
  }


  guardarEditarPermiso() {
    
    const _permiso: Permiso = {
      id: this.datosPermiso ? this.datosPermiso.id : 0,
      nombre: this.formularioPermiso.value.nombre,
      descripcion: this.formularioPermiso.value.descripcion,
      activo: this.formularioPermiso.value.activo
    };

     if (!this.datosPermiso) {
      // CREAR
      this._permisoServicio.crear(_permiso).subscribe({
        next: (data: ResponseApi) => {
          if (data.estado) {
            this._utilidadServicio.mostrarAlerta("El permiso fue asignado con éxito", "Éxito");
            this.modalActual.close("true");
          } else {
            this._utilidadServicio.mostrarAlerta(data.mensaje, "Opps!");
          }
        },
        error: () => {
          this._utilidadServicio.mostrarAlerta("No se pudo asignar el permiso", "Opps!");
        }
      });
    } else {
      // EDITAR
      this._permisoServicio.editar(_permiso).subscribe({
        next: (data: ResponseApi) => {
          if (data.estado) {
            this._utilidadServicio.mostrarAlerta("El permiso fue actualizado con éxito", "Éxito");
            this.modalActual.close("true");
          } else {
            this._utilidadServicio.mostrarAlerta(data.mensaje, "Opps!");
          }
        },
        error: () => {
          this._utilidadServicio.mostrarAlerta("No se pudo actualizar el permiso", "Opps!");
        }
      });
    }
  }
}
