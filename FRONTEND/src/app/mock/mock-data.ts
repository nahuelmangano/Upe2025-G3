export interface Problema { tipo?: string; titulo: string; activo?: boolean; }
export interface Evolucion { fecha: string; hora?: string; titulo?: string; descripcion?: string; }
export interface Indicacion { descripcion: string; evolucion: string; problema: string; fecha: string; }
export const MOCK_RESUMEN = {
  problemas: <Problema[]>[ { titulo: 'Apto físico', activo: true }, { tipo: 'Alergia', titulo: 'Alergia a penicilina' } ],
  evoluciones: <Evolucion[]>[
    { fecha: '08/09/2025', hora: '14:00 hs', titulo: 'Dolor abdominal', descripcion: 'Presenta dolor en el abdomen por comida en mal estado' },
    { fecha: '08/09/2025', hora: '14:00 hs', titulo: 'Alergia a penicilina', descripcion: 'Algo' }
  ],
  indicaciones: <Indicacion[]>[ { descripcion: 'Reposo', evolucion: '08/09/2025', problema: 'Dolor abdominal', fecha: '08/09/2025' } ]
};
