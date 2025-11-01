import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '../../../reutilizable/shared/shared-module';
import { UtilidadService } from '../../../reutilizable/utilidad.service';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioCambiarPasswordPorMail } from 'src/app/interfaces/UsuarioCambiarPasswordPorMail';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedModule, RouterModule],
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

