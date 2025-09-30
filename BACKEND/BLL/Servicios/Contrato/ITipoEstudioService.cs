using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface ITipoEstudioService
    {
        Task<List<TipoEstudioDTO>> Lista();
    }
}
