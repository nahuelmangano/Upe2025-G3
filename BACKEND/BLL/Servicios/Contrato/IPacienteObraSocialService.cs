using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IPacienteObraSocialService
    {
        Task<List<PacienteObraSocialDTO>> ListaPorPacienteObraSocial(int pacienteId, int obraSocialId);

        Task<PacienteObraSocialDTO> Crear(PacienteObraSocialDTO modelo);

        Task<bool> Editar(PacienteObraSocialDTO modelo);

        Task<bool> Desactivar(int id); 
    }
}
