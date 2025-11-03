import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sesion } from '../interfaces/sesion';

@Injectable({
  providedIn: 'root'
})
export class UtilidadService {
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
}
