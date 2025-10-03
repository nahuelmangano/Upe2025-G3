using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IObraSocialService
    {
        Task<List<ObraSocialDTO>> Lista();
        Task<ObraSocialDTO> Crear(ObraSocialDTO modelo);
        Task<bool> Editar(ObraSocialDTO modelo);
        Task<bool> Eliminar(int id);
    }


}
