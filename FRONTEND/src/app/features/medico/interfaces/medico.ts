export interface Medico {
    id: number,
    matricula: string,
    fechaVencimientoMatricula: Date,
    usuarioId: number,
    usuarioNombre?: string | null,
    usuarioApellido?: string | null,
    usuarioMail?: string | null,
    usuarioEstadoNombre?: string | null,
    rolNombre?: string | null
}
