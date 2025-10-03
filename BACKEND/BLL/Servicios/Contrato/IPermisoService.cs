using BE;
using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IPermisoService
    {
        Task<List<PermisoDTO>> Lista();
        Task<PermisoDTO> Crear(PermisoDTO modelo);
        Task<bool>Editar(PermisoDTO modelo);
        Task<bool> Eliminar(int id);
    }
}