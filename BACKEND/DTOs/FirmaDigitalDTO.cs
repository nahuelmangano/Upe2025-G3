using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class FirmaDigitalDTO
    {
        public int Id { get; set; }

        public string? Algoritmo { get; set; }

        public byte[]? CertificadoPublico { get; set; }

        public DateTime FechaFirma { get; set; }

        public byte[]? Firma { get; set; }

        public string? HashDocumento { get; set; }

        public int? Valido { get; set; }
    }
}
