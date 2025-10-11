import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ModalUsuarioComponent } from '../../modals/modal-usuario/modal-usuario.component';
import { Usuario } from 'src/app/interfaces/usuario';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UtilidadService } from 'src/app/reutilizable/utilidad.service';
import { SharedModule } from 'src/app/reutilizable/shared/shared-module';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent implements OnInit, AfterViewInit {

  columnasTabla: string[] = ['nombre', 'apellido', 'mail', 'rolNombre', 'estado', 'matricula', 'vencimientoMatricula' ,'acciones'];
  dataInicio: Usuario[] = [];
  dataListaUsuarios = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private _usuarioServicio: UsuarioService,
    private _utilidadServicio: UtilidadService
  ) { }

  obtenerUsuarios() {
    this._usuarioServicio.lista().subscribe({
      next: (data) => {
        if (data.estado) {
          this.dataListaUsuarios.data = data.valor;
        } else {
          this._utilidadServicio.mostrarAlerta("No se encontraron registros", "Opps!");
        }
      },
      error: () => {
        this._utilidadServicio.mostrarAlerta("No se pudo cargar la lista de roles", "Opps!");
      }
    });
  }

  ngOnInit(): void {
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
      title: '¿Desea eliminar el usuario?',
      text: usuario.nombre,
      icon: 'warning',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'No, volver'
    })
    .then((resultado) => {
      if (resultado.isConfirmed) {
        this._usuarioServicio.eliminar(usuario.id).subscribe({
          next: (data) => {
            if (data.estado) {
              this._utilidadServicio.mostrarAlerta("El usuario fue eliminado", "Listo!");
              this.obtenerUsuarios();
            } else {
              this._utilidadServicio.mostrarAlerta("No se pudo eliminar el usuario", "Error");
            }
          },
          error: () => {
            this._utilidadServicio.mostrarAlerta("No se pudo eliminar el usuario", "Error");
          }
        });
      }
    })
  }
}
