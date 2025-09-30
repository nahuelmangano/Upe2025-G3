using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IPlantillaServicie
    {
        Task<List<PlantillaDTO>> ListaPorMedico(int medicoId);

        Task<PlantillaDTO> Crear(PlantillaDTO modelo);

        Task<bool> Editar(PlantillaDTO modelo);

        Task<bool> Eliminar(int id); 
    }
}
