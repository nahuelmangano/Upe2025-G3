export interface Estudio {
    id: number,
    fecha: Date,
    realizadoPor: string,
    resultado?: string | null,
    observaciones: string,
    tipoEstudioId: number,
    tipoEstudioNombre?: string | null,
    evolucionId: number,
    evolucionDescripcion?: string | null
}
