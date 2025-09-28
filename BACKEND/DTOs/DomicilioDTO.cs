using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class DomicilioDTO
    {
        public int Id { get; set; }

        public string? Altura { get; set; }

        public string? Calle { get; set; }

        public string? Ciudad { get; set; }

        public string? CodigoPostal { get; set; }

        public string? Departamento { get; set; }

        public string? Pais { get; set; }

        public string? Piso { get; set; }

        public string? Provincia { get; set; }
    }
}
