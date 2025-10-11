import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Rol } from 'src/app/interfaces/rol';
import { Usuario } from 'src/app/interfaces/usuario';
import { RolService } from 'src/app/services/rol.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UtilidadService } from 'src/app/reutilizable/utilidad.service';
import { SharedModule } from 'src/app/reutilizable/shared/shared-module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-usuario',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './modal-usuario.component.html',
  styleUrl: './modal-usuario.component.css',
})
export class ModalUsuarioComponent {
  formularioUsuario: FormGroup;
  ocultarPassword = true;
  tituloAccion = "Agregar";
  botonAccion = "Guardar";
  listaRoles: Rol[] = [];

  constructor(
    private modalActual: MatDialogRef<ModalUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public datosUsuario: Usuario,
    private fb: FormBuilder,
    private _rolServicio: RolService,
    private _usuarioServicio: UsuarioService,
    private _utilidadServicio: UtilidadService
  ) {
    this.formularioUsuario = this.fb.group({
      nombre: ["", Validators.required],
      apellido: ["", Validators.required],
      mail: ["", Validators.required],
      passwordHash: ["", Validators.required],
      estadoId: ["", Validators.required],
      rolId: ["", Validators.required],
      matricula: [""], // opcional
      fechaVencimientoMatricula: [""] // opcional
    });

    if (this.datosUsuario != null) {
      this.tituloAccion = "Editar";
      this.botonAccion = "Actualizar";
    }

    this._rolServicio.lista().subscribe({
      next: (data) => {
        if (data.estado) {
          this.listaRoles = data.valor;
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
      estadoId: String(this.datosUsuario.estadoId),
      rolId: String(this.datosUsuario.rolId),
      matricula: this.datosUsuario.matricula ?? "",
      fechaVencimientoMatricula: this.datosUsuario.fechaVencimientoMatricula ?? ""
      });
    }
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
        next: (data) => {
          if (data.estado) {
            this._utilidadServicio.mostrarAlerta("Usuario creado con exito", "exito");
            this.modalActual.close("true");
          } else {
            this._utilidadServicio.mostrarAlerta("No se puedo registrar el usuario", "Error");
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
            this._utilidadServicio.mostrarAlerta("No se puedo editar el usuario", "Error");
          }
        },
        error: () => {
          this._utilidadServicio.mostrarAlerta("Hubo un error en el proceso", "Error");
        }
      })
    }
  }

}