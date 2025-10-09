using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CampoController : ControllerBase
    {
        private readonly ICampoService _campoService;

        public CampoController(ICampoService campoService)
        {
            _campoService = campoService;
        }

        [HttpGet]
        [Route("ListaPorPlantilla/{plantillaId:int}")]
        public async Task<IActionResult> ListaPorPlantilla(int plantillaId)
        {
            var rsp = new Response<List<CampoDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _campoService.ListaPorPlantilla(plantillaId);
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
        public async Task<IActionResult> Crear([FromBody] CampoDTO campo)
        {
            var rsp = new Response<CampoDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _campoService.Crear(campo);
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
        public async Task<IActionResult> Editar([FromBody] CampoDTO campo)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _campoService.Editar(campo);
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
                rsp.Valor = await _campoService.Desactivar(id);
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
