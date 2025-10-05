import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PacientesService, Paciente, PacienteCreate, PacienteUpdate } from '../services/pacientes.service';
import { DomicilioService, DomicilioInput } from '../services/domicilio.service';

@Component({
  standalone: true,
  selector: 'app-pacientes',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card" style="margin-bottom:12px">
      <h3 class="h3" style="margin-bottom:12px">Pacientes</h3>
      <div style="display:flex; gap:10px; align-items:center; margin-bottom:12px">
        <button class="btn" type="button" (click)="openModal()">+ Nuevo Paciente</button>
        <input [(ngModel)]="q" placeholder="Buscar..." style="flex:1" />
      </div>

      <div *ngIf="loading">Cargando pacientes...</div>
      <div *ngIf="error" style="color:#d63031">{{ error }}</div>

      <ng-container *ngIf="!loading && !error">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Telefono</th>
                <th>Ciudad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pageItems()">
                <td>{{ p.nombre }}</td>
                <td>{{ p.email }}</td>
                <td>{{ p.telefono }}</td>
                <td>{{ p.ciudad }}</td>
                <td>{{ p.estado }}</td>
                <td>
                  <div style="display:flex;gap:10px;align-items:center">
                    <a (click)="openEdit(p)" title="Editar" style="cursor:pointer;color:#4b5563">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </a>
                    <a (click)="confirmDelete(p)" title="Eliminar" style="cursor:pointer;color:#d63031">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </a>
                    <a (click)="verResumen(p)" style="cursor:pointer;color:var(--primary)">Resumen</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px">
          <div style="display:flex; gap:8px; align-items:center">
            <small>Items per page:</small>
            <select [(ngModel)]="pageSize">
              <option [ngValue]="5">5</option>
              <option [ngValue]="10">10</option>
            </select>
          </div>
          <div style="display:flex; gap:10px; align-items:center">
            <small>{{ rangeLabel() }}</small>
            <button class="btn-outline" (click)="prev()" [disabled]="page===0"><</button>
            <button class="btn-outline" (click)="next()" [disabled]="(page+1)>=pagesCount()">></button>
          </div>
        </div>
      </ng-container>
    </div>

    <div *ngIf="modalOpen" class="modal-backdrop">
      <div class="modal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3 class="h3" style="margin:0">{{ editId ? 'Editar Paciente' : 'Nuevo Paciente' }}</h3>
          <button class="btn-outline" type="button" (click)="closeModal()">x</button>
        </div>

        <form (ngSubmit)="save()" #pacienteForm="ngForm" style="display:grid;gap:12px">
          <div class="modal-grid">
            <label>
              <span>Nombre</span>
              <input required [(ngModel)]="form.nombre" name="nombre" />
            </label>
            <label>
              <span>Apellido</span>
              <input required [(ngModel)]="form.apellido" name="apellido" />
            </label>
            <label>
              <span>DNI</span>
              <input [(ngModel)]="form.dni" name="dni" />
            </label>
            <label>
              <span>Email</span>
              <input type="email" [(ngModel)]="form.email" name="email" />
            </label>
            <label>
              <span>Telefono 1</span>
              <input [(ngModel)]="form.telefono1" name="telefono1" />
            </label>
            <label>
              <span>Telefono 2</span>
              <input [(ngModel)]="form.telefono2" name="telefono2" />
            </label>
            <label>
              <span>Nacionalidad</span>
              <input [(ngModel)]="form.nacionalidad" name="nacionalidad" />
            </label>
            <label>
              <span>Ocupacion</span>
              <input [(ngModel)]="form.ocupacion" name="ocupacion" />
            </label>
            <label>
              <span>Grupo sanguineo</span>
              <input [(ngModel)]="form.grupoSanguineo" name="grupoSanguineo" />
            </label>
            <label>
              <span>Sexo</span>
              <select [(ngModel)]="form.sexoId" name="sexoId">
                <option [ngValue]="undefined">Sin especificar</option>
                <option [ngValue]="1">Femenino</option>
                <option [ngValue]="2">Masculino</option>
              </select>
            </label>
            <label>
              <span>Fecha de nacimiento</span>
              <input type="date" [(ngModel)]="fechaNacLocal" name="fechaNac" />
            </label>

            <label>
              <span>Calle</span>
              <input [(ngModel)]="domicilio.calle" name="domicilioCalle" />
            </label>
            <label>
              <span>Altura</span>
              <input [(ngModel)]="domicilio.altura" name="domicilioAltura" />
            </label>
            <label>
              <span>Piso</span>
              <input [(ngModel)]="domicilio.piso" name="domicilioPiso" />
            </label>
            <label>
              <span>Departamento</span>
              <input [(ngModel)]="domicilio.departamento" name="domicilioDepartamento" />
            </label>
            <label>
              <span>Ciudad</span>
              <input [(ngModel)]="domicilio.ciudad" name="domicilioCiudad" />
            </label>
            <label>
              <span>Provincia</span>
              <input [(ngModel)]="domicilio.provincia" name="domicilioProvincia" />
            </label>
            <label>
              <span>Pais</span>
              <input [(ngModel)]="domicilio.pais" name="domicilioPais" />
            </label>
            <label>
              <span>Codigo postal</span>
              <input [(ngModel)]="domicilio.codigoPostal" name="domicilioCodigoPostal" />
            </label>
          </div>

          <div *ngIf="modalError" style="color:#d63031">{{ modalError }}</div>

          <div style="display:flex;gap:10px;justify-content:flex-end">
            <button class="btn-outline" type="button" (click)="closeModal()">Cancelar</button>
            <button class="btn" type="submit" [disabled]="saving || pacienteForm.invalid">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <div *ngIf="deleteOpen" class="modal-backdrop">
      <div class="modal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3 class="h3" style="margin:0">Eliminar Paciente</h3>
          <button class="btn-outline" type="button" (click)="cancelDelete()">x</button>
        </div>
        <p style="margin:0 0 16px 0">¿Esta seguro que desea eliminar al paciente {{ toDelete?.nombre }}?</p>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button class="btn-outline" type="button" (click)="cancelDelete()">Cancelar</button>
          <button class="btn" type="button" (click)="doDelete()">Eliminar</button>
        </div>
      </div>
    </div>
  `
})
export class PacientesComponent implements OnInit {
  q = '';
  data: Paciente[] = [];
  page = 0;
  pageSize = 5;
  loading = false;
  error = '';

  modalOpen = false;
  saving = false;
  modalError = '';
  form: PacienteCreate = {};
  domicilio: DomicilioInput = {};
  fechaNacLocal = '';
  editId: number | null = null;

  constructor(
    private api: PacientesService,
    private domicilios: DomicilioService,
    private router: Router
  ) {}

  ngOnInit(): void { this.load(); }

  private load(): void {
    this.loading = true;
    this.error = '';
    this.api.list().subscribe({
      next: pacientes => {
        this.data = pacientes;
        this.page = 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'No pudimos cargar los pacientes. Intentalo de nuevo.';
      }
    });
  }

  openModal(): void {
    this.modalOpen = true;
    this.modalError = '';
    this.form = { sexoId: undefined };
    this.domicilio = {};
    this.fechaNacLocal = '';
    this.editId = null;
  }

  closeModal(): void {
    if (this.saving) { return; }
    this.modalOpen = false;
  }

  async save(): Promise<void> {
    if (this.saving) { return; }
    this.saving = true;
    this.modalError = '';

    try {
      let domicilioId: number | undefined;
      if (this.hasDomicilioData()) {
        domicilioId = await firstValueFrom(this.domicilios.crear(this.domicilio));
      }

      const basePayload: PacienteCreate = {
        ...this.form,
        fechaNac: this.fechaNacLocal ? new Date(this.fechaNacLocal).toISOString() : undefined,
        domicilioId,
        domicilioCalle: this.domicilio.calle,
        domicilioAltura: this.domicilio.altura,
        domicilioPiso: this.domicilio.piso,
        domicilioDepartamento: this.domicilio.departamento,
        domicilioCiudad: this.domicilio.ciudad,
        domicilioProvincia: this.domicilio.provincia,
        domicilioPais: this.domicilio.pais,
        domicilioCodigoPostal: this.domicilio.codigoPostal
      };

      if (this.editId !== null) {
        const payload: PacienteUpdate = { id: this.editId, ...basePayload };
        const updated = await firstValueFrom(this.api.update(payload));
        this.data = this.data.map(p => (p.id === updated.id ? updated : p));
      } else {
        const nuevo = await firstValueFrom(this.api.create(basePayload));
        this.data = [nuevo, ...this.data];
      }
      this.q = '';
      this.page = 0;
      this.closeModal();
    } catch (error: any) {
      this.modalError = error?.message || 'No pudimos guardar el paciente. Revisa los datos e intenta de nuevo.';
    } finally {
      this.saving = false;
    }
  }

  private hasDomicilioData(): boolean {
    return Object.values(this.domicilio).some(value => {
      if (value === null || value === undefined) { return false; }
      if (typeof value === 'string') { return value.trim().length > 0; }
      return true;
    });
  }

  filtradas(): Paciente[] {
    const term = this.q.toLowerCase();
    return this.data.filter(p =>
      `${p.nombre} ${p.email} ${p.telefono} ${p.ciudad} ${p.estado}`.toLowerCase().includes(term)
    );
  }

  pagesCount(): number { return Math.max(1, Math.ceil(this.filtradas().length / this.pageSize)); }

  pageItems(): Paciente[] {
    const start = this.page * this.pageSize;
    return this.filtradas().slice(start, start + this.pageSize);
  }

  rangeLabel(): string {
    const total = this.filtradas().length;
    const start = total ? this.page * this.pageSize + 1 : 0;
    const end = Math.min(total, (this.page + 1) * this.pageSize);
    return `${start} - ${end} of ${total}`;
  }

  prev(): void {
    if (this.page > 0) {
      this.page--;
    }
  }

  next(): void {
    if ((this.page + 1) < this.pagesCount()) {
      this.page++;
    }
  }

  verResumen(p: Paciente): void {
    this.router.navigate(['/pacientes', p.id, 'resumen']);
  }

  openEdit(p: Paciente): void {
    this.modalOpen = true;
    this.modalError = '';
    this.editId = p.id;
    // Prefill with available info from list
    const parts = (p.nombre || '').trim().split(/\s+/);
    const apellidoAuto = parts.length > 1 ? parts.pop()! : '';
    const nombreAuto = parts.join(' ');
    this.form = {
      nombre: nombreAuto || p.nombre,
      apellido: apellidoAuto,
      email: p.email,
      telefono1: p.telefono,
      sexoId: undefined,
      nacionalidad: undefined,
      ocupacion: undefined,
      grupoSanguineo: undefined
    };
    this.domicilio = {};
    this.fechaNacLocal = '';
  }

  // Delete confirmation modal state
  deleteOpen = false;
  toDelete: Paciente | null = null;

  confirmDelete(p: Paciente): void {
    this.toDelete = p;
    this.deleteOpen = true;
  }

  async doDelete(): Promise<void> {
    if (!this.toDelete) { return; }
    try {
      await firstValueFrom(this.api.eliminar(this.toDelete.id));
      this.data = this.data.filter(x => x.id !== this.toDelete!.id);
      this.toDelete = null;
      this.deleteOpen = false;
    } catch {
      // In case of error, just keep the modal open; optionally show a message later
      this.deleteOpen = false;
    }
  }

  cancelDelete(): void {
    this.deleteOpen = false;
    this.toDelete = null;
  }
}
