using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs
{
    public class LoginDTO
    {
        public string? Mail { get; set; }
        public string? PasswordHash { get; set; }
    }
}
