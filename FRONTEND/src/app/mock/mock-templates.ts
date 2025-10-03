export interface Plantilla { id: string; titulo: string; categoria?: string; cuerpo: string; visibilidad: 'privada'|'clinica'|'global'; tags?: string[]; ownerUserId: string; createdAt: string; updatedAt: string; }
export const MOCK_PLANTILLAS: Plantilla[] = [
  { id:'tpl-aptogym', titulo:'Apto físico (gimnasio)', categoria:'Certificados', cuerpo:`CERTIFICADO DE APTITUD FÍSICA

Paciente: {{Paciente.Nombre}} (DNI {{Paciente.DNI}})
Edad: {{Paciente.Edad}}

Por la presente, certifico que he examinado a {{Paciente.Nombre}} el día {{Fecha}} y se encuentra APTO para realizar actividad física general en {{Centro.Nombre}}.

Recomendaciones: {{Recomendaciones}}

Firma y sello:
{{Medico.Nombre}} - Matrícula {{Medico.Matricula}}`, visibilidad:'privada', tags:['apto','gimnasio'], ownerUserId:'user-demo', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
  { id:'tpl-extraccion', titulo:'Indicación de extracción de sangre', categoria:'Indicaciones', cuerpo:`INDICACIÓN MÉDICA

Paciente: {{Paciente.Nombre}} (DNI {{Paciente.DNI}})

Se indica extracción de sangre para los siguientes estudios:
- Hemograma completo
- Glucemia en ayunas
- Colesterol total y fraccionado

Instrucciones:
- Ayuno de {{AyunoHoras}} horas.
- Asistir al laboratorio {{Centro.Nombre}} el día {{Fecha}}.

Firma:
{{Medico.Nombre}} - Matrícula {{Medico.Matricula}}`, visibilidad:'privada', tags:['extraccion','laboratorio'], ownerUserId:'user-demo', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() }
];
