using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IPacienteService
    {
        Task<List<PacienteDTO>> Lista();
        Task<PacienteDTO> Crear(PacienteDTO modelo);
        Task<bool> Editar(PacienteDTO modelo);
        Task<bool> Desactivar(int id);
    }
}
