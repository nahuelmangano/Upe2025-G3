using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface ICampoValorService
    {
        Task<List<CampoValorDTO>> ListaPorCampoEvolucion(int campoId, int evolucionId);

        Task<List<CampoValorDTO>> ListaPorEvolucion(int evolucionId);

        Task<CampoValorDTO> Crear(CampoValorDTO modelo);

        Task<bool> Editar(CampoValorDTO modelo);

        //Task<bool> Eliminar(int id); no se si tiene logica eliminarlo
    }
}
