using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IEstadoUsuarioService
    {
        Task<List<EstadoUsuarioDTO>> Lista();
    }
}