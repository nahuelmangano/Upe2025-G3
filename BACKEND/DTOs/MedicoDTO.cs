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

        public int UsuarioId { get; set; }

        public string? UsuarioNombre { get; set; }

        public int FirmaDigitalId { get; set; }

        public string? FirmaHash{ get; set; }
    }
}