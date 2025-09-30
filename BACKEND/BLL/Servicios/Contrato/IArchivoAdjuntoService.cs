using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IArchivoAdjuntoService
    {
        Task<List<ArchivoAdjuntoDTO>> ListaPorEstudio(int estudioId);

        Task<ArchivoAdjuntoDTO> Crear(ArchivoAdjuntoDTO modelo);

        Task<bool> Editar(ArchivoAdjuntoDTO modelo);

        Task<Stream> Descargar(int id);

        Task<bool> Eliminar(int id); // para un furo, aun no hay un estado
    }
}