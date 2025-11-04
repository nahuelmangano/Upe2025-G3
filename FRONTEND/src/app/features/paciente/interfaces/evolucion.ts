export interface Evolucion {
    id: number,
    descripcion?: string | null,
    fechaConsulta: Date,
    diagnosticoInicial: string,
    diagnosticoDefinitivo?: string | null,
    pacienteId: number,
    pacienteNombre?: string | null,
    plantillaId: number | null,
    plantillaNombre?: string | null,
    problemaId: number,
    problemaTitulo?: string | null,
    estadoProblemaId: number,
    estadoProblemaNombre?: string | null,
    medicoId: number,
    medicoNombre?: string | null
}
