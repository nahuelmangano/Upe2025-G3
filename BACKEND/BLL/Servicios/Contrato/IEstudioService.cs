using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IEstudioService
    {
        Task<List<EstudioDTO>> ListaPorEvolucion(int evolucionId);

        Task<EstudioDTO> Crear(EstudioDTO modelo);

        Task<bool> Editar(EstudioDTO modelo);

        // Task<bool> Eliminar(int id); ns si tenga sentido eliminarlos
    }
}
