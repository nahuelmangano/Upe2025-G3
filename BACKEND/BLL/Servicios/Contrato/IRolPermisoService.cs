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
        Task<List<RolPermisoDTO>> ListaPorRolPermiso(int rolId, int permisoId);

        Task<RolPermisoDTO> Crear(RolPermisoDTO modelo);

        Task<bool> Editar(RolPermisoDTO modelo);

        //Task<bool> Eliminar(int id); no se si tiene logica eliminarlo
    }
}