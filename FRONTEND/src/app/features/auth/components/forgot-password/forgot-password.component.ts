import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UtilidadService } from '@core/services/utilidad.service';
import { UsuarioService } from '@features/auth/services/usuario.service';
import { UsuarioCambiarPasswordPorMail } from '@features/admin/interfaces/UsuarioCambiarPasswordPorMail';
import { CORE_IMPORTS, FORMS_IMPORTS, INTERACTION_IMPORTS, LAYOUT_IMPORTS } from '@shared/shared-imports';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ...CORE_IMPORTS,
    ...FORMS_IMPORTS,
    ...INTERACTION_IMPORTS,
    ...LAYOUT_IMPORTS,
    RouterModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  formularioForgot = inject(FormBuilder).group({
    email: ['', [Validators.required, Validators.email]]
  });

  mostrarLoading: boolean = false;

  private router = inject(Router);
  private _usuarioServicio = inject(UsuarioService);
  private _utilidadServicio = inject(UtilidadService);

  enviarMailCambiarPassword() {
    if (this.formularioForgot.invalid) {
      return;
    }

    this.mostrarLoading = true;

    const request: UsuarioCambiarPasswordPorMail = {
      mail: this.formularioForgot.value.email as string
    }
    
    this._usuarioServicio.enviarMailCambiarPassword(request).subscribe({
      next: (data) => {
        if (data.estado) {
          this._utilidadServicio.mostrarAlerta("Se ha enviado un correo para cambiar la contraseña", 'Éxito');
          this.router.navigate(['/crear-cuenta']);
        }
        else {
          this._utilidadServicio.mostrarAlerta(data.mensaje, 'Opps!');
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

  volverAlLogin() {
    this.router.navigate(['/login']);
  }
}

