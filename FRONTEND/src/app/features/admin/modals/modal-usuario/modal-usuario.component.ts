import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Rol } from '@core/interfaces/rol';
import { Usuario } from '@features/admin/interfaces/usuario';
import { RolService } from '@core/services/rol.service';
import { UsuarioService } from '@features/auth/services/usuario.service';
import { UtilidadService } from '@core/services/utilidad.service';
import { EstadoUsuario } from '@features/admin/interfaces/estado-usuario';
import { EstadoUsuarioService } from '@features/auth/services/estado-usuario.service';
import { SHARED_IMPORTS } from '@shared/shared-imports';
import { ResponseApi } from '@core/interfaces/response-api';

@Component({
  selector: 'app-modal-usuario',
  standalone: true,
  imports: [ ...SHARED_IMPORTS ],
  templateUrl: './modal-usuario.component.html',
  styleUrls: ['./modal-usuario.component.css'],
})
export class ModalUsuarioComponent {
  formularioUsuario: FormGroup;
  ocultarPassword = true;
  tituloAccion = "Agregar";
  botonAccion = "Guardar";
  listaRoles: Rol[] = [];
  listaEstadosUsuarios: EstadoUsuario[] = [];
  mostrarCamposMedico = false;

  constructor(
    private modalActual: MatDialogRef<ModalUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public datosUsuario: Usuario,
    private fb: FormBuilder,
    private _rolServicio: RolService,
    private _estadoUsuarioServicio: EstadoUsuarioService,
    private _usuarioServicio: UsuarioService,
    private _utilidadServicio: UtilidadService
  ) {
    this.formularioUsuario = this.fb.group({
      nombre: ["", Validators.required],
      apellido: ["", Validators.required],
      mail: ["", Validators.required],
      passwordHash: ["", Validators.required],
      estadoId: [null],
      rolId: ["", Validators.required],
      matricula: [""], 
      fechaVencimientoMatricula: [""] 
    });

    if (this.datosUsuario != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
    }

    this._estadoUsuarioServicio.lista().subscribe({
      next: (data) => {
        if (data.estado) {
          this.listaEstadosUsuarios = data.valor;
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron registros", "Opps!");
        }
      },
      error: () => {
        this._utilidadServicio.mostrarAlerta("No se pudo cargar la lista de usuarios", "Opps!");
      }
    });

    this._rolServicio.lista().subscribe({
      next: (data) => {
        if (data.estado) {
          this.listaRoles = data.valor;
        }

        //verificar si es medico para mostrar matricula y su fecha de vencimiento
        if (this.datosUsuario != null && this.datosUsuario.rolId != null) {
          this.verificarSiEsMedico(this.datosUsuario.rolId);
        }
      },
      error: () => {
        this._utilidadServicio.mostrarAlerta("No se pudo cargar la lista de roles", "Opps!");
      }
    });
  }

  ngOnInit(): void {
    if (this.datosUsuario != null) {
      this.formularioUsuario.patchValue({
        nombre: this.datosUsuario.nombre,
        apellido: this.datosUsuario.apellido,
        mail: this.datosUsuario.mail,
        passwordHash: this.datosUsuario.passwordHash,
        estadoId: this.datosUsuario.estadoId,
        rolId: this.datosUsuario.rolId,
        matricula: this.datosUsuario.matricula ?? "",
        fechaVencimientoMatricula: this.datosUsuario.fechaVencimientoMatricula ?? ""
      });
    }
    this.formularioUsuario.get('rolId')?.valueChanges.subscribe(rolId => {
      this.verificarSiEsMedico(rolId);
    });
  }

  verificarSiEsMedico(rolId: string | number): void {
    const rolSeleccionado = this.listaRoles.find(rol => rol.id === Number(rolId));
    this.mostrarCamposMedico = rolSeleccionado?.nombre?.toLowerCase() === 'medico';
    
    // si es medico hacer que los campos de matricula y fecha de vencimiento son obligatorios
    this.actualizarValidadores();
  }

  actualizarValidadores(): void {
    const matriculaControl = this.formularioUsuario.get('matricula');
    const fechaVencimientoControl = this.formularioUsuario.get('fechaVencimientoMatricula');

    if (this.mostrarCamposMedico) {
      // si es meico, hacer campos requeridos
      matriculaControl?.setValidators([Validators.required]);
      fechaVencimientoControl?.setValidators([Validators.required]);
    } else {
      // Si no es sacar validadores
      matriculaControl?.clearValidators();
      fechaVencimientoControl?.clearValidators();
      matriculaControl?.setValue('');
      fechaVencimientoControl?.setValue('');
    }

    matriculaControl?.updateValueAndValidity();
    fechaVencimientoControl?.updateValueAndValidity();
  }

  guardarEditarUsuario() {
    const _usuario: Usuario = {
      id: this.datosUsuario == null ? 0 : this.datosUsuario.id,
      nombre: this.formularioUsuario.value.nombre,
      apellido: this.formularioUsuario.value.apellido,
      mail: this.formularioUsuario.value.mail,
      passwordHash: this.formularioUsuario.value.passwordHash,
      estadoId: parseInt(this.formularioUsuario.value.estadoId),
      estadoNombre: "",
      rolId: this.formularioUsuario.value.rolId,
      rolNombre: "",
      matricula: this.formularioUsuario.value.matricula,
      fechaVencimientoMatricula: this.formularioUsuario.value.fechaVencimientoMatricula
    }

    // crear usuario
    if (this.datosUsuario == null) {
      this._usuarioServicio.crear(_usuario).subscribe({
        next: (data: ResponseApi) => {
          if (data.estado) {
            this._utilidadServicio.mostrarAlerta("Usuario creado con exito", "exito");
            this.modalActual.close("true");
          } else {
            this._utilidadServicio.mostrarAlerta(data.mensaje, "Error");
          }
        },
        error: () => {
          this._utilidadServicio.mostrarAlerta("Hubo un error en el proceso", "Error");
        }
      })
    } else {
      // editar usuario
      this._usuarioServicio.editar(_usuario).subscribe({
        next: (data) => {
          if (data.estado) {
            this._utilidadServicio.mostrarAlerta("Usuario editado con exito", "exito");
            this.modalActual.close("true");
          } else {
            this._utilidadServicio.mostrarAlerta(data.mensaje, "Error");
          }
        },
        error: () => {
          this._utilidadServicio.mostrarAlerta("Hubo un error en el proceso", "Error");
        }
      })
    }
  }

}