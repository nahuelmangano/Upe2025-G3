using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IFirmaService
    {
        Task<List<FirmaDigitalDTO>> ListaPorMedico(int medicoId);

        Task<FirmaDigitalDTO> Crear(FirmaDigitalDTO modelo);

        Task<bool> Editar(FirmaDigitalDTO modelo);

        Task<bool> Eliminar(int id); 
    }
}