import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { PlantillaService } from 'src/app/services/plantilla.service';
import { UtilidadService } from 'src/app/reutilizable/utilidad.service';
import { ResponseApi } from 'src/app/interfaces/response-api';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-lista-plantillas',
  standalone: true,
  templateUrl: './lista-plantillas.html',
  styleUrl: './lista-plantillas.css',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule
  ]
})
export class ListaPlantillasComponent implements OnInit {
  private plantillaService = inject(PlantillaService);
  private utilidadService = inject(UtilidadService);

  filtro: string = '';
  dataSource: any[] = [];
  todasPlantillas: any[] = []; 

  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'acciones'];

  ngOnInit(): void {
    this.cargarPlantillasDelMedico();
  }

  cargarPlantillasDelMedico() {
    const medicoId = this.utilidadService.obtenerUsuarioId();
    this.plantillaService.listaPorMedico(medicoId).subscribe({
      next: (res: ResponseApi) => {
        if (res.estado && Array.isArray(res.valor)) {
          this.dataSource = res.valor;
          this.todasPlantillas = res.valor;
        }
      },
      error: (err: any) => console.error('Error al listar plantillas', err)
    });
  }

  filtrarPlantillas(valor: string | null) {
    if (!valor) {
      this.dataSource = [...this.todasPlantillas];
      return;
    }
    this.dataSource = this.todasPlantillas.filter(p =>
      (p.nombre || '').toLowerCase().includes(valor.toLowerCase()) ||
      (p.descripcion || '').toLowerCase().includes(valor.toLowerCase())
    );
  }

  verPlantilla(plantilla: any) {
    alert(`Abrir plantilla: ${plantilla.nombre}`);
  }

  completarPlantilla(plantilla: any) {
    alert(`Completar plantilla: ${plantilla.nombre}`);
  }
}
