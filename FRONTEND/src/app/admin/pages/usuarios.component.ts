import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService, Usuario, UsuarioInput } from '../services/usuarios.service';
import { CatalogoService, Opcion } from '../services/catalogo.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-admin-usuarios',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" style="margin-bottom:12px">
      <h3 class="h3" style="margin-bottom:12px">Usuarios</h3>
      <div style="display:flex; gap:10px; align-items:center; margin-bottom:12px">
        <button class="btn" type="button" (click)="openModal()">+ Nuevo Usuario</button>
        <input [(ngModel)]="q" placeholder="Buscar..." style="flex:1" />
      </div>

      <div *ngIf="loading">Cargando usuarios...</div>
      <div *ngIf="error" style="color:#d63031">{{ error }}</div>

      <ng-container *ngIf="!loading && !error">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of pageItems()">
                <td>{{ u.nombre }} {{ u.apellido }}</td>
                <td>{{ u.mail }}</td>
                <td>{{ u.rolNombre || ('#'+u.rolId) }}</td>
                <td>{{ u.estadoNombre || ('#'+u.estadoId) }}</td>
                <td>
                  <div style="display:flex;gap:10px;align-items:center">
                    <a (click)="openEdit(u)" title="Editar" style="cursor:pointer;color:#4b5563">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </a>
                    <a (click)="confirmDelete(u)" title="Eliminar" style="cursor:pointer;color:#d63031">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:10px">
          <div style="display:flex; gap:8px; align-items:center">
            <small>Items por página:</small>
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

    <!-- Modal crear/editar -->
    <div *ngIf="modalOpen" class="modal-backdrop">
      <div class="modal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3 class="h3" style="margin:0">{{ editId ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
          <button class="btn-outline" type="button" (click)="closeModal()">x</button>
        </div>

        <form (ngSubmit)="save()" #userForm="ngForm" style="display:grid;gap:12px">
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
              <span>Email</span>
              <input required type="email" [(ngModel)]="form.mail" name="mail" />
            </label>
            <label *ngIf="!editId">
              <span>Password</span>
              <input required type="password" [(ngModel)]="password" name="password" />
            </label>
            <label>
              <span>Rol</span>
              <select required [(ngModel)]="form.rolId" name="rolId">
                <option *ngFor="let r of roles" [ngValue]="r.id">{{r.nombre}}</option>
              </select>
            </label>
            <label>
              <span>Estado</span>
              <select required [(ngModel)]="form.estadoId" name="estadoId">
                <option *ngFor="let e of estados" [ngValue]="e.id">{{e.nombre}}</option>
              </select>
            </label>
          </div>

          <div *ngIf="modalError" style="color:#d63031">{{ modalError }}</div>

          <div style="display:flex;gap:10px;justify-content:flex-end">
            <button class="btn-outline" type="button" (click)="closeModal()">Cancelar</button>
            <button class="btn" type="submit" [disabled]="saving || userForm.invalid">
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal eliminar -->
    <div *ngIf="deleteOpen" class="modal-backdrop">
      <div class="modal-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <h3 class="h3" style="margin:0">Eliminar Usuario</h3>
          <button class="btn-outline" type="button" (click)="cancelDelete()">x</button>
        </div>
        <p style="margin:0 0 16px 0">¿Esta seguro que desea eliminar al usuario {{ toDelete?.nombre }} {{ toDelete?.apellido }}?</p>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button class="btn-outline" type="button" (click)="cancelDelete()">Cancelar</button>
          <button class="btn" type="button" (click)="doDelete()">Eliminar</button>
        </div>
      </div>
    </div>
  `
})
export class UsuariosComponent implements OnInit {
  q = '';
  data: Usuario[] = [];
  page = 0;
  pageSize = 5;
  loading = false;
  error = '';

  modalOpen = false;
  saving = false;
  modalError = '';
  editId: number | null = null;
  form: UsuarioInput = { nombre:'', apellido:'', mail:'', rolId:1, estadoId:1 };
  password = '';

  deleteOpen = false;
  toDelete: Usuario | null = null;

  estados: Opcion[] = [];
  roles: Opcion[] = [];

  constructor(private usuarios: UsuariosService, private catalogo: CatalogoService) {}

  ngOnInit(): void {
    this.loading = true;
    this.catalogo.estadoUsuario().subscribe(e => this.estados = e);
    this.catalogo.roles().subscribe(r => this.roles = r);
    this.usuarios.list().subscribe({
      next: res => { this.data = res; this.loading = false; },
      error: () => { this.error = 'No pudimos cargar los usuarios'; this.loading = false; }
    });
  }

  filtradas(): Usuario[] {
    const term = this.q.toLowerCase();
    return this.data.filter(u => `${u.nombre} ${u.apellido} ${u.mail} ${u.rolNombre} ${u.estadoNombre}`.toLowerCase().includes(term));
  }
  pagesCount(): number { return Math.max(1, Math.ceil(this.filtradas().length / this.pageSize)); }
  pageItems(): Usuario[] { const s = this.page * this.pageSize; return this.filtradas().slice(s, s + this.pageSize); }
  rangeLabel(): string { const t = this.filtradas().length; const s = t ? this.page * this.pageSize + 1 : 0; const e = Math.min(t, (this.page + 1) * this.pageSize); return `${s} - ${e} de ${t}`; }
  prev(): void { if (this.page>0) this.page--; }
  next(): void { if ((this.page+1) < this.pagesCount()) this.page++; }

  openModal(): void {
    this.modalOpen = true; this.modalError = ''; this.editId = null; this.password='';
    this.form = { nombre:'', apellido:'', mail:'', rolId: this.roles[0]?.id || 1, estadoId: this.estados[0]?.id || 1 };
  }
  openEdit(u: Usuario): void {
    this.modalOpen = true; this.modalError = ''; this.editId = u.id; this.password='';
    this.form = { nombre:u.nombre, apellido:u.apellido, mail:u.mail, rolId:u.rolId, estadoId:u.estadoId };
  }
  closeModal(): void { if (!this.saving) this.modalOpen = false; }

  async save(): Promise<void> {
    if (this.saving) return; this.saving = true; this.modalError='';
    try {
      if (this.editId) {
        await firstValueFrom(this.usuarios.update(this.editId, this.form));
        const rolNombre = this.roles.find(r=>r.id===this.form.rolId)?.nombre;
        const estadoNombre = this.estados.find(e=>e.id===this.form.estadoId)?.nombre;
        this.data = this.data.map(u => u.id === this.editId ? { id: this.editId!, ...this.form, rolNombre, estadoNombre } as unknown as Usuario : u);
      } else {
        const nuevo = await firstValueFrom(this.usuarios.create({ ...this.form, passwordHash: this.password }));
        this.data = [nuevo, ...this.data];
      }
      this.page = 0; this.q=''; this.closeModal();
    } catch (e:any) {
      this.modalError = e?.message || 'No pudimos guardar el usuario';
    } finally { this.saving = false; }
  }

  confirmDelete(u: Usuario): void { this.toDelete = u; this.deleteOpen = true; }
  cancelDelete(): void { this.deleteOpen = false; this.toDelete = null; }
  async doDelete(): Promise<void> {
    if (!this.toDelete) return; try {
      await firstValueFrom(this.usuarios.eliminar(this.toDelete.id));
      this.data = this.data.filter(x => x.id !== this.toDelete!.id);
      this.cancelDelete();
    } catch { this.cancelDelete(); }
  }
}
