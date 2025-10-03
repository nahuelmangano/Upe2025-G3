using BE;
using BLL.Servicios.Contrato;
using DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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

        [HttpPost]
        [Route("Crear")]
        public async Task<IActionResult> Crear([FromBody] TipoEstudioDTO modelo)
        {
            var rsp = new Response<TipoEstudioDTO>();
            try
            {
                rsp.Estado = true;
                rsp.Valor = await _tipoEstudioServicio.Crear(modelo);
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
        public async Task<IActionResult> Editar([FromBody] TipoEstudioDTO modelo)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _tipoEstudioServicio.Editar(modelo);
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
        public async Task<IActionResult>Eliminar(int id)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _tipoEstudioServicio.Eliminar(id);
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
