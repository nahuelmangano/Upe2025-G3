using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoEstudioController : ControllerBase
    {
        private readonly ITipoEstudioService _tipoEstudioServicio;

        public TipoEstudioController(ITipoEstudioService tipoEstudioServicio)
        {
            _tipoEstudioServicio = tipoEstudioServicio;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            var rsp = new Response<List<TipoEstudioDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _tipoEstudioServicio.Lista();
            }
            catch (Exception ex)
            {
                rsp.Estado = false;
                rsp.Mensaje = ex.Message;
            }

            return Ok(rsp);
        }

        // habria q agregar todo el CRUD
    }
}
