using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EvolucionController : ControllerBase
    {
        private readonly IEvolucionService _evolucionServicio;

        public EvolucionController(IEvolucionService evolucionServicio)
        {
            _evolucionServicio = evolucionServicio;
        }

        [HttpGet]
        [Route("ListaPorPaciente/{pacienteId:int}")]
        public async Task<IActionResult> ListaPorPaciente(int pacienteId)
        {
            var rsp = new Response<List<EvolucionDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _evolucionServicio.ListaPorPaciente(pacienteId);
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
        public async Task<IActionResult> Crear([FromBody] EvolucionDTO evolucion)
        {
            var rsp = new Response<EvolucionDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _evolucionServicio.Crear(evolucion);
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
        public async Task<IActionResult> Editar([FromBody] EvolucionDTO evolucion)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _evolucionServicio.Editar(evolucion);
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
