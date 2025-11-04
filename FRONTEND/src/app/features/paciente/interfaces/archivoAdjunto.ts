export interface ArchivoAdjunto {
    id: number,
    fechaSubida?: Date | null,
    nombreArchivo: string,
    tamano?: number | null,
    url?: string | null,
    estudioId: number,
    estudioTipoNombre?: string | null,
    activo: number
}
