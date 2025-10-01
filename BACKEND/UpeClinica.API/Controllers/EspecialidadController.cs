using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EspecialidadController : ControllerBase
    {
        public IEspecialidadService _especialidadServicio;

        public EspecialidadController(IEspecialidadService especialidadServicio)
        {
            _especialidadServicio = especialidadServicio;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            var respuesta = new Response<List<EspecialidadDTO>>();

            try
            {
                respuesta.Estado = true;
                respuesta.Valor = await _especialidadServicio.Lista();
            }
            catch (Exception ex)
            {
                respuesta.Estado = false;
                respuesta.Mensaje = ex.Message;
            }

            return Ok(respuesta);
        }
    }
}
