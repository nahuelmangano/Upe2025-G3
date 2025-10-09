using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class ArchivoAdjuntoDTO
    {
        public int Id { get; set; }

        public string? FechaSubida { get; set; }

        public string NombreArchivo { get; set; } = null!;

        public int? Tamano { get; set; }

        public string? Url { get; set; }

        public int EstudioId { get; set; }

        public string? EstudioTipoNombre { get; set; }

        public int Activo { get; set; }
    }
}
