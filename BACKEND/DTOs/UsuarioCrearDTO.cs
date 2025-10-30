using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class UsuarioCrearDTO
    {
        public string Nombre { get; set; } = null!;

        public string Apellido { get; set; } = null!;

        public string Mail { get; set; } = null!;

        public string PasswordHash { get; set; } = null!;

        public int RolId { get; set; }

        public string? Matricula { get; set; }

        public string? FechaVencimientoMatricula { get; set; }
    }

}