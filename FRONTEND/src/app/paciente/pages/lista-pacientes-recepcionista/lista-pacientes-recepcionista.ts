import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { CommonModule, ViewportScroller } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { PacienteService } from '../../../services/paciente.service';
import { Paciente } from '../../../interfaces/paciente';
import { ResponseApi } from '../../../interfaces/response-api';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-lista-pacientes-recepcionista',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
    MatDividerModule,
    MatIconModule,
    MatCardModule,
    MatPaginator,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './lista-pacientes-recepcionista.html',
  styleUrl: './lista-pacientes-recepcionista.css'
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
  ) { }

  ngOnInit(): void {
    this.cargarPacientes();
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

  nuevoPaciente(): void {
    this.router.navigate(['/pages/recepcionista/pacientes/crear']).then(() => {
      this.scroller.scrollToPosition([0, 0]);
    })
  }
  
  editarPaciente(paciente: Paciente): void {
    this.router.navigate(['/pages/recepcionista/paciente/' + paciente.id + '/editar']).then(() => {
      this.scroller.scrollToPosition([0, 0]);
    })
  }
}