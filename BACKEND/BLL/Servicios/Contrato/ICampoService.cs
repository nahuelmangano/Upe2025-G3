using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface ICampoService
    {
        Task<List<CampoDTO>> ListaPorPlantilla(int plantillaId);

        Task<CampoDTO> Crear(CampoDTO modelo);

        Task<bool> Editar(CampoDTO modelo);

        Task<bool> Desactivar(int id);
    }
}