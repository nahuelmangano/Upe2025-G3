export interface Usuario {
    id: number,
    nombre: string,
    apellido: string,
    mail: string,
    passwordHash: string,
    estadoId: number,
    estadoNombre?: string | null,
    rolId: number,
    rolNombre?: string | null,
    matricula?: string | null,
    fechaVencimientoMatricula?: string | null
}
