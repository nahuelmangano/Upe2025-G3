using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IProblemaService
    {
        Task<List<ProblemaDTO>> Lista();
        Task<ProblemaDTO> Crear(ProblemaDTO modelo);
        Task<bool> Editar(ProblemaDTO modelo);
        Task<bool> Eliminar(int id);
    }
}