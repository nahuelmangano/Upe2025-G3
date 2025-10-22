using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class MedicoDTO
    {
        public int Id { get; set; }

        public string Matricula { get; set; } = null!;

        public DateOnly FechaVencimientoMatricula { get; set; }

        public int UsuarioId { get; set; }

        public string? UsuarioNombre { get; set; }

        public string? UsuarioApellido { get; set; }

        public string? UsuarioMail { get; set; }

        public string? UsuarioEstadoNombre { get; set; }

        public string? RolNombre { get; set; }
    }
}