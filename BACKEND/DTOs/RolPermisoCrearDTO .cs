using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class RolPermisoCrearDTO
    {

        public int RolId { get; set; }

        public string? RolNombre { get; set; }

        public int PermisoId { get; set; }

        public string? PermisoNombre { get; set; }
    }
}
