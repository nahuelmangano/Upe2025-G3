using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolPermisoController : ControllerBase
    {
        private readonly IRolPermisoService _permisoServicio;

        public RolPermisoController(IRolPermisoService permisoServicio)
        {
            _permisoServicio = permisoServicio;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            var rsp = new Response<List<RolPermisoDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _permisoServicio.Lista();
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
        public async Task<IActionResult> Crear([FromBody] RolPermisoCrearDTO campoValor)
        {
            var rsp = new Response<RolPermisoDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _permisoServicio.Crear(campoValor);
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
        public async Task<IActionResult> Editar([FromBody] RolPermisoEditarDTO campoValor)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _permisoServicio.Editar(campoValor);
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
                rsp.Valor = await _permisoServicio.Desactivar(id);
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
