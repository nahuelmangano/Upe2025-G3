export interface Campo {
    id: number,
    etiqueta?: string | null,
    obligatorio?: boolean | null,
    opciones?: string | null,
    orden?: number | null,
    tipoCampoId: number,
    tipoCampoNombre?: string | null,
    plantillaId: number,
    plantillaNombre?: string | null,
    activo: number
}