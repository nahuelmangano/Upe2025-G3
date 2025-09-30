using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IMedicoService
    {
        Task<List<MedicoDTO>> Lista();
        Task<MedicoDTO> Crear(MedicoDTO modelo);
        Task<bool> Editar(MedicoDTO modelo);
        Task<bool> Eliminar(int id);
    }
}