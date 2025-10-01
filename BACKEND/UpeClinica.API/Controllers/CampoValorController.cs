using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CampoValorController : ControllerBase
    {
        private readonly ICampoValorService _campoValorServicio;

        public CampoValorController(ICampoValorService campoValorServicio)
        {
            _campoValorServicio = campoValorServicio;
        }

        [HttpGet]
        [Route("ListaPorCampoEvolucion/{campoId:int}/{evolucionId:int}")]
        public async Task<IActionResult> ListaPorCampoEvolucion(int campoId, int evolucionId)
        {
            var rsp = new Response<List<CampoValorDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _campoValorServicio.ListaPorCampoEvolucion(campoId, evolucionId);
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
        public async Task<IActionResult> Crear([FromBody] CampoValorDTO campoValor)
        {
            var rsp = new Response<CampoValorDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _campoValorServicio.Crear(campoValor);
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
        public async Task<IActionResult> Editar([FromBody] CampoValorDTO campoValor)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _campoValorServicio.Editar(campoValor);
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
