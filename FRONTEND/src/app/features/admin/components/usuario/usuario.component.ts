import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ModalUsuarioComponent } from '@features/admin/modals/modal-usuario/modal-usuario.component';
import { Usuario } from '@features/admin/interfaces/usuario';
import { EstadoUsuario } from '@features/admin/interfaces/estado-usuario';
import { UsuarioService } from '@features/auth/services/usuario.service';
import { EstadoUsuarioService } from '@features/auth/services/estado-usuario.service';
import { UtilidadService } from '@core/services/utilidad.service';
import { SHARED_IMPORTS } from '@shared/shared-imports';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [ ...SHARED_IMPORTS ],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit, AfterViewInit {

  columnasTabla: string[] = ['nombre', 'apellido', 'mail', 'rolNombre', 'estado', 'matricula', 'vencimientoMatricula', 'acciones'];
  dataInicio: Usuario[] = [];
  dataEstadosUsuarios: EstadoUsuario[] = [];
  dataListaUsuarios = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private _usuarioServicio: UsuarioService,
    private _estadoUsuarioServicio: EstadoUsuarioService,
    private _utilidadServicio: UtilidadService
  ) { }

  cargarEstadosUsuarios() {
    this._estadoUsuarioServicio.lista().subscribe({
      next: (data) => {
        if (data.estado) {
          this.dataEstadosUsuarios = data.valor;
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron registros", "Opps!");
        }
      },
      error: () => {
        this._utilidadServicio.mostrarAlerta("No se pudo cargar la lista de estados", "Opps!");
      }
    });
  }

  obtenerUsuarios() {
    this._usuarioServicio.lista().subscribe({
      next: (data) => {
        if (data.estado) {
          const usuariosConEstado = (data.valor as Usuario[]).map(usuario => {
            const estado = this.dataEstadosUsuarios.find(estadoUsuario => estadoUsuario.id === usuario.estadoId);
            return {
              ...usuario,
              estadoNombre: estado ? estado.nombre : ''
            } as Usuario;
          });
          this.dataListaUsuarios.data = usuariosConEstado;
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron registros", "Opps!");
        }
      },
      error: () => {
        this._utilidadServicio.mostrarAlerta("No se pudo cargar la lista de usuarios", "Opps!");
      }
    });
  }

  ngOnInit(): void {
    this.cargarEstadosUsuarios();
    this.obtenerUsuarios();
  }

  ngAfterViewInit(): void {
    // paginacion
    this.dataListaUsuarios.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaUsuarios.filter = filterValue.trim().toLocaleLowerCase();
  }

  // Abrir modal
  nuevoUsuario() {
    this.dialog.open(ModalUsuarioComponent, {
      disableClose: true, // No se puede cerrar haciendo clic fuera del modal
    }).afterClosed().subscribe(resultado => {
      if (resultado === 'true')
        this.obtenerUsuarios();
    });
  }

  editarUsuario(usuario: Usuario) {
    this.dialog.open(ModalUsuarioComponent, {
      disableClose: true, // No se puede cerrar haciendo clic fuera del modal
      data: usuario
    }).afterClosed().subscribe(resultado => {
      if (resultado === 'true')
        this.obtenerUsuarios();
    });
  }

  eliminarUsuario(usuario: Usuario) {
    Swal.fire({
      title: '¿Desea desactivar el usuario?',
      text: usuario.nombre,
      icon: 'warning',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desactivar',
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'No, volver'
    })
      .then((resultado) => {
        if (resultado.isConfirmed) {
          this._usuarioServicio.eliminar(usuario.id).subscribe({
            next: (data) => {
              if (data.estado) {
                this._utilidadServicio.mostrarAlerta("El usuario fue desactivado", "Listo!");
                this.obtenerUsuarios();
              } else {
                this._utilidadServicio.mostrarAlerta("No se pudo desactivar el usuario", "Error");
              }
            },
            error: () => {
              this._utilidadServicio.mostrarAlerta("No se pudo desactivar el usuario", "Error");
            }
          });
        }
      })
  }
}
