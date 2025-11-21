import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { UtilidadService } from '@core/services/utilidad.service';
import { SHARED_IMPORTS } from '@shared/shared-imports';
import { RolPermiso } from '@core/interfaces/rol-permiso';
import { Permiso } from '@core/interfaces/permiso';
import { Rol } from '@core/interfaces/rol';
import { PermisoService } from '@core/services/permiso.service';
import { RolService } from '@core/services/rol.service';
import { RolPermisoService } from '@core/services/rol-permiso.service';
import { ModalPermisoRecepcionistaComponent } from '@features/admin/modals/modal-permiso-recepcionista/modal-permiso.component';
import { MatPaginatorIntl } from '@angular/material/paginator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-permiso',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './recepcionista-permiso.component.html',
  styleUrl: './recepcionista-permiso.component.css',
  providers: [
    {
      provide: MatPaginatorIntl,
      useFactory: (utilidadService: UtilidadService) => utilidadService.getSpanishPaginatorIntl(),
      deps: [UtilidadService]
    }
  ]
})
export class RecepcionistaPermisoComponent implements OnInit, AfterViewInit {
  columnasTabla: string[] = ['permiso', 'acciones'];
  dataInicio: RolPermiso[] = [];
  dataListaPermisos: Permiso[] = [];
  dataListaRol: Rol[] = [];

  dataListaPermisosRoles = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private _utilidadServicio: UtilidadService,
    private _permisoServicio: PermisoService,
    private _rolServicio: RolService,
    private _rolPermisoServicio: RolPermisoService
  ) { }

  cargarRolPermisoServicio() {
    this._rolPermisoServicio.lista().subscribe({
      next: (data) => {
        if (data.estado) {
          this.dataListaPermisosRoles.data = data.valor;
          this.dataListaPermisosRoles.data = this.dataListaPermisosRoles.data.filter(rp => rp.rolNombre === 'Recepcionista');

        } else {
          this._utilidadServicio.mostrarAlerta(data.mensaje, "Opps!");
        }
      }
    });
  }

  ngOnInit(): void {
    this.cargarRolPermisoServicio();
  }

  ngAfterViewInit(): void {
    this.dataListaPermisosRoles.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaPermisosRoles.filter = filterValue.trim().toLocaleLowerCase();
  }

  nuevoRolPermiso() {
    this.dialog.open(ModalPermisoRecepcionistaComponent, {
      disableClose: true
    }).afterClosed().subscribe(resultado => {
      if (resultado === 'true')
        this.cargarRolPermisoServicio();
    });
  }

  editarRolPermiso(rolPermiso: RolPermiso) {
    this.dialog.open(ModalPermisoRecepcionistaComponent, {
      disableClose: true, // No se puede cerrar haciendo clic fuera del modal
      data: rolPermiso
    }).afterClosed().subscribe(resultado => {
      if (resultado === 'true')
        this.cargarRolPermisoServicio();
    });
  }

  eliminarRolPermiso(rolPermiso: RolPermiso) {
    Swal.fire({
      title: '¿Desea eliminar la asignacion?',
      text: rolPermiso.permisoNombre ?? '',
      icon: 'warning',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'No, volver'
    })
      .then((resultado) => {
        if (resultado.isConfirmed) {
          this._rolPermisoServicio.eliminar(rolPermiso.id).subscribe({
            next: (data) => {
              if (data.estado) {
                this._utilidadServicio.mostrarAlerta("El permiso asignado fue eliminado", "Listo!");
                this.cargarRolPermisoServicio();
              } else {
                this._utilidadServicio.mostrarAlerta("No se pudo desactivar el permiso", "Error");
              }
            },
            error: () => {
              this._utilidadServicio.mostrarAlerta("No se pudo desactivar el permiso", "Error");
            }
          });
        }
      })
  }

}