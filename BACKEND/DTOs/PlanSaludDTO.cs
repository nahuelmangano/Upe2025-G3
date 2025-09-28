using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class PlanSaludDTO
    {
        public long Id { get; set; }

        public long Codigo { get; set; }

        public string Nombre { get; set; } = null!;

        public int ObraSocialId { get; set; }

        public string? ObraSocialNombre { get; set; }
    }
}