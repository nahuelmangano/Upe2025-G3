using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IEvolucionService
    {
        Task<List<EvolucionDTO>> ListaPorPaciente(int pacienteId);

        Task<EvolucionDTO> Crear(EvolucionDTO modelo);

        Task<bool> Editar(EvolucionDTO modelo);

        Task<bool> Eliminar(int id);
    }
}