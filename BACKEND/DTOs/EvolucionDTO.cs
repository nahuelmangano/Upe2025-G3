using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class EvolucionDTO
    {
        public int Id { get; set; }

        public string? Descripcion { get; set; }

        public DateTime FechaConsulta { get; set; }

        public string DiagnosticoInicial { get; set; } = null!;

        public string? DiagnosticoDefinitivo { get; set; }

        public int PacienteId { get; set; }

        public string? PacienteNombre{ get; set; } 

        public int PlantillaId { get; set; }

        public string? PlantillaNombre { get; set; }

        public int ProblemaId { get; set; }

        public string? ProblemaTitulo { get; set; }

        public int EstadoProblemaId { get; set; }

        public string? EstadoProblemaNombre { get; set; }

        public int MedicoId { get; set; }

        public string? MedicoNombre { get; set; }
    }
}
