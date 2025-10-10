export interface FirmaDigital {
    id: number,
    algoritmo?: string | null,
    certificadoPublico?: Uint8Array | null,
    fechaFirma: Date,
    firma?: Uint8Array | null,
    hashDocumento?: string | null,
    valido?: number | null,
    medicoId: number,
    medicoNombre?: string | null
}
