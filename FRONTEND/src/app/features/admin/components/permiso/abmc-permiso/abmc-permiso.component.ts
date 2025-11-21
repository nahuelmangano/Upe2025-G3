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
import { ModalPermisoMedicoComponent } from '@features/admin/modals/modal-permiso-medico/modal-permiso.component';
import { MatPaginatorIntl } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { ModalPermisoComponent } from '@features/admin/modals/modal-permiso/modal-permiso.component';

@Component({
  selector: 'app-permiso',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './abmc-permiso.component.html',
  styleUrl: './abmc-permiso.component.css',
  providers: [
    {
      provide: MatPaginatorIntl,
      useFactory: (utilidadService: UtilidadService) => utilidadService.getSpanishPaginatorIntl(),
      deps: [UtilidadService]
    }
  ]
})
export class ABMCPermisoComponent implements OnInit, AfterViewInit {
  columnasTabla: string[] = ['nombre', 'descripcion', 'estado', 'acciones'];
  dataInicio: Permiso[] = [];

  dataListaPermisos = new MatTableDataSource(this.dataInicio);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private _utilidadServicio: UtilidadService,
    private _permisoServicio: PermisoService
  ) { }

  cargarPermiso() {
    this._permisoServicio.lista().subscribe({
      next: (data) => {
        if (data.estado) {
          this.dataListaPermisos.data = data.valor;
          console.log(this.dataListaPermisos.data);
          
        } else {
          this._utilidadServicio.mostrarAlerta(data.mensaje, "Opps!");
        }
      }
    });
  }

  ngOnInit(): void {
    this.cargarPermiso();
  }

  ngAfterViewInit(): void {
    this.dataListaPermisos.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaPermisos.filter = filterValue.trim().toLocaleLowerCase();
  }

  nuevoPermiso() {
    this.dialog.open(ModalPermisoComponent, {
      disableClose: true
    }).afterClosed().subscribe(resultado => {
      if (resultado === 'true')
        this.cargarPermiso();
    });
  }

  editarPermiso(permiso: Permiso) {
    this.dialog.open(ModalPermisoComponent, {
      disableClose: true,
      data: permiso
    }).afterClosed().subscribe(resultado => {
      if (resultado === 'true')
        this.cargarPermiso();
    });
  }

  eliminarPermiso(permiso: Permiso) {
    Swal.fire({
      title: '¿Desea eliminar el permiso?',
      text: permiso.nombre ?? '',
      icon: 'warning',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'No, volver'
    })
      .then((resultado) => {
        if (resultado.isConfirmed) {
          this._permisoServicio.eliminar(permiso.id).subscribe({
            next: (data) => {
              if (data.estado) {
                this._utilidadServicio.mostrarAlerta("El permiso fue eliminado", "Listo!");
                this.cargarPermiso();
              } else {
                this._utilidadServicio.mostrarAlerta(data.mensaje, "Error");
              }
            },
            error: () => {
              this._utilidadServicio.mostrarAlerta("No se pudo eliminar el permissasso", "Error");
            }
          });
        }
      })
  }

}