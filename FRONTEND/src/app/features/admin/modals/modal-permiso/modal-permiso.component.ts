import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UtilidadService } from '@core/services/utilidad.service';
import { SHARED_IMPORTS } from '@shared/shared-imports';
import { ResponseApi } from '@core/interfaces/response-api';
import { Rol } from '@core/interfaces/rol';
import { Permiso } from '@core/interfaces/permiso';
import { PermisoCrear } from '@core/interfaces/permiso-crear';
import { RolService } from '@core/services/rol.service';
import { RolPermisoService } from '@core/services/rol-permiso.service';
import { RolPermiso } from '@core/interfaces/rol-permiso';
import { PermisoService } from '@core/services/permiso.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-permiso',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './modal-permiso.component.html',
  styleUrl: './modal-permiso.component.css'
})
export class ModalPermisoComponent {
  formularioPermiso: FormGroup;
  tituloAccion = "Asignar";
  botonAccion = "Guardar";
  listaRoles: Rol[] = [];
  listaPermisos: Permiso[] = [];

  constructor(
    private modalActual: MatDialogRef<ModalPermisoComponent>,
    @Inject(MAT_DIALOG_DATA) public datosRolPermiso: RolPermiso,
    private fb: FormBuilder,
    private _utilidadServicio: UtilidadService,
    private _rolServicio: RolService,
    private _permisoServicio: PermisoService,
    private _rolPermisoServicio: RolPermisoService
  ) {
    this.formularioPermiso = this.fb.group({
      rolId: ["", Validators.required],
      permisoId: ["", Validators.required],
      activo: [""]
    });

    if (this.datosRolPermiso != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
    }

    this._rolServicio.lista().subscribe({
      next: (data) => {
        if (data.estado) {
          this.listaRoles = data.valor.filter((rol: any) => rol.id !== 1);
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron registros", "Opps!");
        }
      },
      error: () => {
        this._utilidadServicio.mostrarAlerta("No se pudo cargar la lista de usuarios", "Opps!");
      }
    });

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
    if (this.datosRolPermiso != null) {
      this.formularioPermiso.patchValue({
        rolId: this.datosRolPermiso.rolId,
        permisoId: this.datosRolPermiso.permisoId,
        activo: this.datosRolPermiso.activo
      });
    }
  }

  guardarEditarRolPermiso() {
    {
      const _rolPermiso: RolPermiso = {
        id: this.datosRolPermiso == null ? 0 : this.datosRolPermiso.id,
        rolId: this.formularioPermiso.value.rolId,
        permisoId: this.formularioPermiso.value.permisoId,
        activo: this.datosRolPermiso == null ? 1 : this.formularioPermiso.value.activo
      };

      if (this.datosRolPermiso == null) {
        //guardar
        this._rolPermisoServicio.crear(_rolPermiso).subscribe({
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
      }
      else {
        //editar
        _rolPermiso.id = this.datosRolPermiso.id;
        this._rolPermisoServicio.editar(_rolPermiso).subscribe({
          next: (data: ResponseApi) => {
            if (data.estado) {
              this._utilidadServicio.mostrarAlerta("El permiso fue actualizado con éxito", "Éxito");
              this.modalActual.close("true");
            }
            else {
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

  crearPermiso() {
    Swal.fire({
      title: 'Crear Nuevo Permiso',
      html: `
        <div class="swal-form-group">
          <label>Nombre del permiso</label>
          <input id="swal-input1" class="swal2-input" placeholder="Ej: Gestionar usuarios" required>
        </div>
        <div class="swal-form-group">
          <label>Descripción</label>
          <input id="swal-input2" class="swal2-input" placeholder="Ej: Permite gestionar usuarios del sistema" required>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#352D77',
      cancelButtonColor: '#6c757d',
      width: '480px',
      padding: '32px',
      customClass: {
        popup: 'swal2-popup-custom',
        title: 'swal2-title-custom',
        htmlContainer: 'swal2-html-container-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      },
      preConfirm: () => {
        const nombre = (document.getElementById('swal-input1') as HTMLInputElement).value.trim();
        const descripcion = (document.getElementById('swal-input2') as HTMLInputElement).value.trim();
        
        if (!nombre || !descripcion) {
          Swal.showValidationMessage('Por favor complete todos los campos');
          return false;
        }
        
        if (nombre.length < 3) {
          Swal.showValidationMessage('El nombre debe tener al menos 3 caracteres');
          return false;
        }
        
        if (descripcion.length < 5) {
          Swal.showValidationMessage('La descripción debe tener al menos 5 caracteres');
          return false;
        }
        
        return { nombre, descripcion };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const nuevoPermiso: PermisoCrear = {
          Nombre: result.value.nombre,
          Descripcion: result.value.descripcion,
          Activo: true
        };

        this._permisoServicio.crear(nuevoPermiso).subscribe({
          next: (data: ResponseApi) => {
            if (data.estado) {
              // Verificar si la respuesta contiene el permiso creado
              let permisoCreado: Permiso | undefined;
              if (data.valor && data.valor.id) {
                permisoCreado = data.valor as Permiso;
              }

              // Recargar lista de permisos para asegurar que está actualizada
              this._permisoServicio.lista().subscribe({
                next: (listaData) => {
                  if (listaData.estado) {
                    this.listaPermisos = listaData.valor;
                    // Seleccionar el permiso recién creado
                    if (!permisoCreado) {
                      permisoCreado = this.listaPermisos.find(p => p.nombre === nuevoPermiso.Nombre);
                    } else {
                      // Buscar por ID para estar seguro
                      permisoCreado = this.listaPermisos.find(p => p.id === permisoCreado!.id);
                    }
                    
                    if (permisoCreado) {
                      this.formularioPermiso.patchValue({
                        permisoId: permisoCreado.id
                      });
                      this._utilidadServicio.mostrarAlerta("El permiso fue creado con éxito", "Éxito");
                    } else {
                      this._utilidadServicio.mostrarAlerta("El permiso fue creado pero no se pudo seleccionar", "Atención");
                    }
                  } else {
                    this._utilidadServicio.mostrarAlerta("El permiso fue creado pero no se pudo cargar la lista", "Atención");
                  }
                },
                error: () => {
                  this._utilidadServicio.mostrarAlerta("El permiso fue creado pero no se pudo cargar la lista", "Atención");
                }
              });
            } else {
              this._utilidadServicio.mostrarAlerta(data.mensaje, "Opps!");
            }
          },
          error: () => {
            this._utilidadServicio.mostrarAlerta("No se pudo crear el permiso", "Opps!");
          }
        });
      }
    });
  }
}
