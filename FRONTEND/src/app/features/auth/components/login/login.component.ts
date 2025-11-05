import { inject } from '@angular/core';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Login } from '@features/auth/interfaces/login';
import { UsuarioService } from '@features/auth/services/usuario.service';
import { CORE_IMPORTS, FORMS_IMPORTS, INTERACTION_IMPORTS, LAYOUT_IMPORTS } from '@shared/shared-imports';
import { UtilidadService } from '@core/services/utilidad.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ...CORE_IMPORTS,
    ...FORMS_IMPORTS,
    ...INTERACTION_IMPORTS,
    ...LAYOUT_IMPORTS,
    RouterModule, ],
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
      mail: this.formularioLogin.value.email?.trim() as string,
      passwordHash: this.formularioLogin.value.password?.trim() as string
    };

    this._usuarioServicio.iniciarSesion(request).subscribe({
      next: (data) => {
        if (data.estado) {
          this._utilidadServicio.guardarSesionUsuario(data.valor);

          const usuario = data.valor;
          if (usuario.rolNombre === 'Medico') {
            this.router.navigate(['/medico']);
          } else if (usuario.rolNombre === 'Recepcionista') {
            this.router.navigate(['/recepcionista']);
          } else if (usuario.rolNombre === 'Administrador') {
            this.router.navigate(['/admin']);
          } else {
            this._utilidadServicio.mostrarAlerta('Rol de usuario no reconocido', 'Error');
          }
        } else {
          this._utilidadServicio.mostrarAlerta(data.mensaje, 'Opps!');
        }
      },
      complete: () => { this.mostrarLoading = false; },
      error: () => {
        this._utilidadServicio.mostrarAlerta("Hubo un error", 'Opps!');
        this.mostrarLoading = false;
      }
    });
  }

}