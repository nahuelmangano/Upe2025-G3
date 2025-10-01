using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlanSaludController : ControllerBase
    {
        private readonly IPlanSaludService _planSaludServicio;

        public PlanSaludController(IPlanSaludService planSaludServicio)
        {
            _planSaludServicio = planSaludServicio;
        }

        [HttpGet]
        [Route("ListaPorObraSocial/{obraSocialId:int}")]
        public async Task<IActionResult> ListaPorObraSocial(int obraSocialId)
        {
            var rsp = new Response<List<PlanSaludDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _planSaludServicio.ListaPorObraSocial(obraSocialId);
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
        public async Task<IActionResult> Crear([FromBody] PlanSaludDTO plan)
        {
            var rsp = new Response<PlanSaludDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _planSaludServicio.Crear(plan);
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
        public async Task<IActionResult> Editar([FromBody] PlanSaludDTO plan)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _planSaludServicio.Editar(plan);
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
