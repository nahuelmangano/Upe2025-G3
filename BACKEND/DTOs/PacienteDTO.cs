using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class PacienteDTO
    {
        public int Id { get; set; }

        public string Nombre { get; set; } = null!;

        public string Apellido { get; set; } = null!;

        public string Dni { get; set; } = null!;

        public string? Email { get; set; }

        public DateTime FechaNac { get; set; }

        public string? GrupoSanguineo { get; set; }

        public string? Nacionalidad { get; set; }

        public string? Ocupacion { get; set; }

        public string Telefono1 { get; set; } = null!;

        public string? Telefono2 { get; set; }

        public int? DomicilioId { get; set; }

        public string? DomicilioCiudad { get; set; }

        public int? SexoId { get; set; }

        public string? SexoNombre { get; set; }

        public int Activo { get; set; }
    }
}
