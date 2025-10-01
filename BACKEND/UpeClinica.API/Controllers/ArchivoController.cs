using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArchivoController : ControllerBase
    {
        private readonly IArchivoAdjuntoService _archivoServicio;

        public ArchivoController(IArchivoAdjuntoService archivoService)
        {
            this._archivoServicio = archivoService;
        }

        [HttpGet]
        [Route("ListaPorEstudio/{estudioId:int}")]
        public async Task<IActionResult> ListaPorEstudio(int estudioId)
        {
            var rsp = new Response<List<ArchivoAdjuntoDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _archivoServicio.ListaPorEstudio(estudioId);
            }
            catch (Exception ex)
            {
                rsp.Estado = false;
                rsp.Mensaje = ex.Message;
            }

            return Ok(rsp);
        }

        [HttpPost]
        [Route("Crear")]
        public async Task<IActionResult> Crear([FromBody] ArchivoAdjuntoDTO archivo)
        {
            var rsp = new Response<ArchivoAdjuntoDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _archivoServicio.Crear(archivo);
            }
            catch (Exception ex)
            {
                rsp.Estado = false;
                rsp.Mensaje = ex.Message;
            }

            return Ok(rsp);
        }

        [HttpPut]
        [Route("Editar")]
        public async Task<IActionResult> Editar([FromBody] ArchivoAdjuntoDTO archivo)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _archivoServicio.Editar(archivo);
            }
            catch (Exception ex)
            {
                rsp.Estado = false;
                rsp.Mensaje = ex.Message;
            }

            return Ok(rsp);
        }
        /// <summary>
        /// La elimina posta
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut]
        [Route("Eliminar/{id:int}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _archivoServicio.Eliminar(id);
            }
            catch (Exception ex)
            {
                rsp.Estado = false;
                rsp.Mensaje = ex.Message;
            }

            return Ok(rsp);
        }
    }
}
