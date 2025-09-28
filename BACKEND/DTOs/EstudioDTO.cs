using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class EstudioDTO
    {
        public int Id { get; set; }

        public DateTime Fecha { get; set; }

        public string RealizadoPor { get; set; } = null!;

        public string? Resultado { get; set; }

        public string Observaciones { get; set; } = null!;

        public int TipoEstudioId { get; set; }

        public string? TipoEstudioNombre { get; set; }

        public int EvolucionId { get; set; }

        public string? EvolucionDescripcion { get; set; }
    }
}
