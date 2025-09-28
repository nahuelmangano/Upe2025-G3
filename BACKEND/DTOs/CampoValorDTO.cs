using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class CampoValorDTO
    {
        public int Id { get; set; }

        public int CampoId { get; set; }

        public string? CampoEtiqueta { get; set; }

        public int EvolucionId { get; set; }

        public string? EvolucionDescripcion { get; set; }

        public string Valor { get; set; } = null!;
    }
}
