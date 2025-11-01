import { Injectable, inject } from '@angular/core';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Login } from '../../../interfaces/login';
import { UsuarioService } from '../../../services/usuario.service';
import { SharedModule } from '../../../reutilizable/shared/shared-module';
import { UtilidadService } from '../../../reutilizable/utilidad.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, RouterModule, MatCheckboxModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  formularioLogin = inject(FormBuilder).group({
    email: ['', Validators.required],
    password: ['', Validators.required],
    recordar: [false]
  });
  ocultarPassword: boolean = true;
  mostrarLoading: boolean = false;

  private router = inject(Router);
  private _usuarioServicio = inject(UsuarioService);
  private _utilidadServicio = inject(UtilidadService);

  iniciarSesion() {

    this.mostrarLoading = true;

    const request: Login = {
      mail: this.formularioLogin.value.email as string,
      passwordHash: this.formularioLogin.value.password as string
    }

    this._usuarioServicio.iniciarSesion(request).subscribe({
      next: (data) => {
        if (data.estado) {
          this._utilidadServicio.guardarSesionUsuario(data.valor);
          // this._utilidadServicio.mostrarAlerta("OK", 'Opps!')
          this.router.navigate(['pages']);
        }
        else {
          this._utilidadServicio.mostrarAlerta(data.mensaje, 'Opps!')
        }
      },
      complete: () => {
        this.mostrarLoading = false;
      },
      error: () => {
        this._utilidadServicio.mostrarAlerta("Hubo un error", 'Opps!')
      }
    });
  }
}