using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class CampoDTO
    {
        public int Id { get; set; }

        public string? Etiqueta { get; set; }

        public bool? Obligatorio { get; set; }

        public string? Opciones { get; set; }

        public int? Orden { get; set; }

        public int? TipoCampoId { get; set; }

        public string? TipoCampoNombre { get; set; }

        public int PlantillaId { get; set; }

        public string? PlantillaNombre { get; set; }

        public int Activo { get; set; }
    }
}