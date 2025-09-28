using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class PlantillaDTO
    {
        public int Id { get; set; }

        public bool? Activo { get; set; }

        public string? Descripcion { get; set; }

        public string? Nombre { get; set; }

        public int MedicoId { get; set; }

        public string? MedicoNombre { get; set; }
    }
}