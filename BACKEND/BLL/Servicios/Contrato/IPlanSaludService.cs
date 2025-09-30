using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IPlanSaludService
    {
        Task<List<PlanSaludDTO>> ListaPorObraSocial(int obraSocialId);

        Task<PlanSaludDTO> Crear(PlanSaludDTO modelo);

        Task<bool> Editar(PlanSaludDTO modelo);

        //Task<bool> Eliminar(int id); // para un furo, aun no hay un estado
    }
}
