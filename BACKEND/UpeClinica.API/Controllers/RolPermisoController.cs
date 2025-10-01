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
        [Route("ListaPorRolPermiso/{rolId:int}/{permisoId:int}")]
        public async Task<IActionResult> ListaPorRolPermiso(int rolId, int permisoId)
        {
            var rsp = new Response<List<RolPermisoDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _permisoServicio.ListaPorRolPermiso(rolId, permisoId);
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
        public async Task<IActionResult> Crear([FromBody] RolPermisoDTO campoValor)
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
        public async Task<IActionResult> Editar([FromBody] RolPermisoDTO campoValor)
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
    }
}
