using System.Collections.Generic;

namespace DTOs
{
    public class ResumenPacienteDTO
    {
        public List<ResumenProblemaDTO> Problemas { get; set; } = new();

        public List<ResumenEvolucionDTO> Evoluciones { get; set; } = new();
    }

    public class ResumenProblemaDTO
    {
        public string? Titulo { get; set; }

        public string? Tipo { get; set; }

        public bool Activo { get; set; }
    }

    public class ResumenEvolucionDTO
    {
        public string? Fecha { get; set; }

        public string? Hora { get; set; }

        public string? Titulo { get; set; }

        public string? Descripcion { get; set; }
    }
}
