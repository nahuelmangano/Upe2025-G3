import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UtilidadService } from '@core/services/utilidad.service';
import { UsuarioService } from '@features/auth/services/usuario.service';
import { UsuarioCambiarPassword } from '@features/admin/interfaces/UsuarioCambiarPassword';
import { CORE_IMPORTS, FORMS_IMPORTS, INTERACTION_IMPORTS, LAYOUT_IMPORTS } from '@shared/shared-imports';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    ...CORE_IMPORTS,
    ...FORMS_IMPORTS,
    ...INTERACTION_IMPORTS,
    ...LAYOUT_IMPORTS,
    RouterModule
  ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {

  formularioRegistro = inject(FormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    passwordHashAntigua: ['', Validators.required],
    nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
    repetirNuevaPassword: ['', Validators.required]
  }, {
    validators: this.passwordMatchValidator
  });

  ocultarPasswordOld: boolean = true;
  ocultarPasswordNew: boolean = true;
  ocultarPasswordConfirm: boolean = true;
  mostrarLoading: boolean = false;

  private router = inject(Router);
  private _usuarioServicio = inject(UsuarioService);
  private _utilidadServicio = inject(UtilidadService);

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const passwordNew = control.get('passwordNew');
    const passwordConfirm = control.get('passwordConfirm');

    if (passwordNew && passwordConfirm && passwordNew.value !== passwordConfirm.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  completarRegistro() {
    if (this.formularioRegistro.invalid) {
      if (this.formularioRegistro.hasError('passwordMismatch')) {
        this._utilidadServicio.mostrarAlerta("Las contraseñas no coinciden", 'Error');
      } else {
        this._utilidadServicio.mostrarAlerta("Por favor completa todos los campos correctamente", 'Error');
      }
      return;
    }

    this.mostrarLoading = true;

    const request: UsuarioCambiarPassword = {
      mail: this.formularioRegistro.value.email as string,
      passwordHashAntigua: this.formularioRegistro.value.passwordHashAntigua as string,
      nuevaPassword: this.formularioRegistro.value.nuevaPassword as string,
      repetirNuevaPassword: this.formularioRegistro.value.repetirNuevaPassword as string
    }

    this._usuarioServicio.cambiarPassword(request).subscribe({
      next: (data) => {
        if (data.estado) {
          this._utilidadServicio.mostrarAlerta("Contraseña cambiada exitosamente", 'Éxito');
          this.router.navigate(['/login']);
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

  volverAlLogin() {
    this.router.navigate(['/login']);
  }

  getPasswordMismatchError(): boolean {
    return this.formularioRegistro.hasError('passwordMismatch') &&
      this.formularioRegistro.get('passwordConfirm')?.touched === true;
  }
}

