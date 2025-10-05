using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IEspecialidadService
    {
        Task<List<EspecialidadDTO>> Lista();
        Task<EspecialidadDTO> ObtenerPorIdAsync(int id);
        Task<EspecialidadDTO> CrearAsync(EspecialidadDTO especialidad);
        Task<EspecialidadDTO> ActualizarAsync(int id, EspecialidadDTO especialidad);
        Task<bool> EliminarAsync(int id);
    }
}
