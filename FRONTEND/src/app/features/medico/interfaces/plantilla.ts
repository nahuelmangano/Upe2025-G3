export interface Plantilla {
    id: number,
    activo?: boolean | null,
    descripcion?: string | null,
    nombre?: string | null,
    medicoId: number,
    medicoNombre?: string | null
}