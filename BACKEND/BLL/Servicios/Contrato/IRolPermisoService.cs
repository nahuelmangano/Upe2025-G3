using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IRolPermisoService
    {
        Task<List<RolPermisoDTO>> Lista();

        Task<RolPermisoDTO> Crear(RolPermisoCrearDTO modelo);

        Task<bool> Editar(RolPermisoEditarDTO modelo);

        Task<bool> Desactivar(int id);
    }
}