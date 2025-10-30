using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class UsuarioEditarDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string Apellido { get; set; } = null!;
        public string Mail { get; set; } = null!;
        public int? EstadoId { get; set; }
        public string? Matricula { get; set; }
        public string? FechaVencimientoMatricula { get; set; }
    }

}
