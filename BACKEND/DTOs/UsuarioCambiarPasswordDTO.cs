using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class UsuarioCambiarPasswordDTO
    {
        public string Mail { get; set; } = null!;
        public string PasswordHashAntigua { get; set; } = null!;
        public string NuevaPassword { get; set; } = null!;
        public string RepetirNuevaPassword { get; set; } = null!;
    }

}