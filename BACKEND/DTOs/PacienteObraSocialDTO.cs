using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class PacienteObraSocialDTO
    {
        public int Id { get; set; }

        public DateTime? VigenteDesde { get; set; }

        public int? Estado { get; set; }

        public int PacienteId { get; set; }

        public string? PacienteNombre { get; set; }

        public int ObraSocialId { get; set; }

        public string? ObraSocialNombre { get; set; }

        public string? NumeroAfiliado { get; set; }
    }
}
