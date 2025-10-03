using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ObraSocialController : ControllerBase
    {
        private readonly IObraSocialService _obraSocialServicio;

        public ObraSocialController(IObraSocialService obraSocialServicio)
        {
            _obraSocialServicio = obraSocialServicio;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            var rsp = new Response<List<ObraSocialDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _obraSocialServicio.Lista();
            }
            catch (Exception ex)
            {
                rsp.Estado = false;
                rsp.Mensaje = ex.Message;
            }

            return Ok(rsp);
        }

        // Puede ser que se deba crear,editar, dar de baja.
        [HttpPost]
        [Route("Crear")]
        public async Task<IActionResult> Crear([FromBody] ObraSocialDTO obraSocial)
        {
            var rsp = new Response<ObraSocialDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _obraSocialServicio.Crear(obraSocial);
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
        public async Task<IActionResult> Editar([FromBody] ObraSocialDTO obraSocial)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _obraSocialServicio.Editar(obraSocial);
            }
            catch (Exception ex)
            {
                rsp.Estado = false;
                rsp.Mensaje = ex.Message;
            }

            return Ok(rsp);
        }

        [HttpPut]
        [Route("Eliminar/{id:int}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _obraSocialServicio.Eliminar(id);
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
