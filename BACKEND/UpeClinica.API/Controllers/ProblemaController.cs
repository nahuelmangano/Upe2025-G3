using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProblemaController : ControllerBase
    {
        private readonly IProblemaService _problemaServicio;

        public ProblemaController(IProblemaService problemaServicio)
        {
            _problemaServicio = problemaServicio;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            var rsp = new Response<List<ProblemaDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _problemaServicio.Lista();
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
        public async Task<IActionResult> Crear([FromBody] ProblemaDTO problema)
        {
            var rsp = new Response<ProblemaDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _problemaServicio.Crear(problema);
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
        public async Task<IActionResult> Editar([FromBody] ProblemaDTO problema)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _problemaServicio.Editar(problema);
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
