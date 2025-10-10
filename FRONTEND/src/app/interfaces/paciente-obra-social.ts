export interface PacienteObraSocial {
    id: number,
    vigenteDesde?: Date | null,
    activo: number,
    pacienteId: number,
    pacienteNombre?: string | null,
    obraSocialId: number,
    obraSocialNombre?: string | null,
    numeroAfiliado?: string | null
}
