export interface UsuarioCambiarPassword {
    mail: string,
    passwordHashAntigua: string,
    nuevaPassword: string,
    repetirNuevaPassword: string
}