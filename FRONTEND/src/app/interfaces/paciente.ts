export interface Paciente {
    id: number,
    nombre: string,
    apellido: string,
    dni: string,
    email?: string | null,
    fechaNac: Date,
    grupoSanguineo?: string | null,
    nacionalidad?: string | null,
    ocupacion?: string | null,
    telefono1: string,
    telefono2?: string | null,
    domicilioId?: number | null,
    domicilioCiudad?: string | null,
    sexoId?: number | null,
    sexoNombre?: string | null,
    activo: number
}
