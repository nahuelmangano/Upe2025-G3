import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CommonModule, ViewportScroller } from '@angular/common';
import { PacienteService } from '@features/paciente/services/paciente.service';
import { Paciente } from '@features/paciente/interfaces/paciente';
import { ResponseApi } from '@core/interfaces/response-api';
import { Router, RouterModule } from '@angular/router';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { SHARED_IMPORTS } from '@shared/shared-imports';
import { UtilidadService } from '@core/services/utilidad.service';
import { RolPermisoService } from '@core/services/rol-permiso.service';


@Component({
  selector: 'app-lista-pacientes-recepcionista',
  standalone: true,
  imports: [ ...SHARED_IMPORTS, RouterModule ],
  templateUrl: './lista-pacientes-recepcionista.html',
  styleUrls: ['./lista-pacientes-recepcionista.css'],
  providers: [
    {
      provide: MatPaginatorIntl,
      useFactory: (utilidadService: UtilidadService) => utilidadService.getSpanishPaginatorIntl(),
      deps: [UtilidadService]
    }
  ]
})
export class ListaPacientesRecepcionistaComponent implements OnInit {
  displayedColumns: string[] = ['dni', 'nombreCompleto', 'telefono1', 'email', 'domicilioCiudad', 'editar'];
  dataSource: Paciente[] = [];
  dataListaPacientes = new MatTableDataSource(this.dataSource);
  @ViewChild(MatPaginator) paginacionTabla!: MatPaginator;

  constructor(
    private pacienteService: PacienteService,
    private router: Router,
    private scroller: ViewportScroller,
    private utilidadService: UtilidadService,
    private rolPermisoServicio: RolPermisoService
  ) { }

  ngOnInit(): void {
    this.cargarPacientes();
    this.cargarRolPermisoServicio();
  }

  cargarPacientes(): void {
    this.pacienteService.lista().subscribe({
      next: (response: ResponseApi) => {
        if (response.estado) {
          this.dataListaPacientes.data = response.valor;
          if (this.paginacionTabla) {
            this.dataListaPacientes.paginator = this.paginacionTabla;
          }
        } else {
          console.error('Error al listar pacientes:', response.mensaje);
        }
      },
      error: (err) => {
        console.error('Error de comunicación con la API:', err);
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataListaPacientes.paginator = this.paginacionTabla;
  }

  aplicarFiltroTabla(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataListaPacientes.filter = filterValue.trim().toLocaleLowerCase();
  }

  cargarRolPermisoServicio() {
    this.rolPermisoServicio.lista().subscribe({
      next: (data) => {
        if (data.estado) {
          this.utilidadService.dataListaRolesPermisos = data.valor;

        } else {
          this.utilidadService.mostrarAlerta(data.mensaje, "Opps!");
        }
      }
    });
  }

  nuevoPaciente(): void {
    if (!this.utilidadService.tienePermiso("Crear Paciente", 3)) {
      this.utilidadService.mostrarAlerta("No tienes permiso para crear los pacientes", "Acceso denegado");
      return;
    }

    this.router.navigate(['/recepcionista/pacientes/crear']).then(() => {
      this.scroller.scrollToPosition([0, 0]);
    })
  }
  
  editarPaciente(paciente: Paciente): void {

    if (!this.utilidadService.tienePermiso("Modificar Paciente", 3)) {
      this.utilidadService.mostrarAlerta("No tienes permiso para editar los pacientes", "Acceso denegado");
      return;
    }

    this.router.navigate(['/recepcionista/paciente/' + paciente.id + '/editar']).then(() => {
      this.scroller.scrollToPosition([0, 0]);
    })
  }
}