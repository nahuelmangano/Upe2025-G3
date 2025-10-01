using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DomicilioController : ControllerBase
    {
        private readonly IDomicilioService _domicilioServicio;

        public DomicilioController(IDomicilioService domicilioServicio)
        {
            _domicilioServicio = domicilioServicio;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            var respuesta = new Response<List<DomicilioDTO>>();
            try
            {
                respuesta.Estado = true;
                respuesta.Valor = await _domicilioServicio.Lista();
            }
            catch (Exception ex)
            {
                respuesta.Estado = false;
                respuesta.Mensaje = ex.Message;
            }

            return Ok(respuesta);
        }

        // tambien se deberia crear cuando se crea el paciente
    }
}
