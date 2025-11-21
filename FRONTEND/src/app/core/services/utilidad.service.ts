import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { RolPermiso } from '@core/interfaces/rol-permiso';
import { Sesion } from '@core/interfaces/sesion';

@Injectable({
  providedIn: 'root'
})
export class UtilidadService {
  dataListaRolesPermisos: RolPermiso[] = [];
  private snackBar = inject(MatSnackBar);

  mostrarAlerta(mensaje: string, tipo: string): void {
    this.snackBar.open(mensaje, tipo, {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 3000
    });
  }

  guardarSesionUsuario(usuarioSession: Sesion): void {
    localStorage.setItem('usuario', JSON.stringify(usuarioSession));
  }

  obtenerSesionUsuario(): Sesion | null {
    const dataCadena = localStorage.getItem('usuario');
    if (!dataCadena) {
      return null;
    }

    try {
      return JSON.parse(dataCadena) as Sesion;
    } catch {
      return null;
    }
  }

  eliminarSesionUsuario(){
    localStorage.removeItem('usuario');
  }

  obtenerUsuarioId(): number {
  const usuario = this.obtenerSesionUsuario();
  return usuario ? usuario.id : 0;
  }

  obtenerNombreCompletoUsuario(): string {
  const usuario = this.obtenerSesionUsuario();
  return usuario ? `${usuario.nombre} ${usuario.apellido}` : '';
  }

  tienePermiso(nombrePermiso: string, rolUsuario: number): boolean {
    return this.dataListaRolesPermisos.some(
      (rp: RolPermiso) => rp.permisoNombre === nombrePermiso && rp.activo == true && rp.rolId == rolUsuario
    );
  }

  getSpanishPaginatorIntl(): MatPaginatorIntl {
    const paginatorIntl = new MatPaginatorIntl();

    paginatorIntl.itemsPerPageLabel = 'Registros por página';
    paginatorIntl.nextPageLabel = 'Página siguiente';
    paginatorIntl.previousPageLabel = 'Página anterior';
    paginatorIntl.firstPageLabel = 'Primera página';
    paginatorIntl.lastPageLabel = 'Última página';
    
    paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return `0 de ${length}`;
      }
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
      return `${startIndex + 1} – ${endIndex} de ${length}`;
    };

    return paginatorIntl;
  }

}
