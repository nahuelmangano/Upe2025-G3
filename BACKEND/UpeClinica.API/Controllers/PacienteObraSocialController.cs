using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PacienteObraSocialController : ControllerBase
    {
        private readonly IPacienteObraSocialService _pacienteObraSocialServicio;

        public PacienteObraSocialController(IPacienteObraSocialService pacienteObraSocialServicio)
        {
            _pacienteObraSocialServicio = pacienteObraSocialServicio;
        }

        [HttpGet]
        [Route("ListaPorPacienteObraSocial/{pacienteId:int}/{obraSocialId:int}")]
        public async Task<IActionResult> ListaPorPacienteObraSocial(int pacienteId, int obraSocialId)
        {
            var rsp = new Response<List<PacienteObraSocialDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _pacienteObraSocialServicio.ListaPorPacienteObraSocial(pacienteId, obraSocialId);
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
        public async Task<IActionResult> Crear([FromBody] PacienteObraSocialDTO pacienteObraSocial)
        {
            var rsp = new Response<PacienteObraSocialDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _pacienteObraSocialServicio.Crear(pacienteObraSocial);
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
        public async Task<IActionResult> Editar([FromBody] PacienteObraSocialDTO pacienteObraSocial)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _pacienteObraSocialServicio.Editar(pacienteObraSocial);
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