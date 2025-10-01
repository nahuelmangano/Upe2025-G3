using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EstudioController : ControllerBase
    {
        private readonly IEstudioService _estudioServicio;

        public EstudioController(IEstudioService estudioServicio)
        {
            _estudioServicio = estudioServicio;
        }

        [HttpGet]
        [Route("ListaPorEvolucion/{evolucionId:int}")]
        public async Task<IActionResult> ListaPorEvolucion(int evolucionId)
        {
            var rsp = new Response<List<EstudioDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _estudioServicio.ListaPorEvolucion(evolucionId);
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
        public async Task<IActionResult> Crear([FromBody] EstudioDTO estudio)
        {
            var rsp = new Response<EstudioDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _estudioServicio.Crear(estudio);
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
        public async Task<IActionResult> Editar([FromBody] EstudioDTO estudio)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _estudioServicio.Editar(estudio);
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