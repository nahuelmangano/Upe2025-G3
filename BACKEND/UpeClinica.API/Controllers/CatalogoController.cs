using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;
namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CatalogoController : ControllerBase
    {
        private readonly IEstadoProblemaService _estadoProblemaService;
        private readonly IEstadoUsuarioService _estadoUsuarioService;
        private readonly IRolService _rolService;
        private readonly ISexoService _sexoService;
        private readonly ITipoCampoService _tipoCampoService;

        public CatalogoController(IEstadoProblemaService estadoProblemaService, IEstadoUsuarioService estadoUsuarioService, IRolService rolService, ISexoService sexoService, ITipoCampoService tipoCampoService)
        {
            _estadoProblemaService = estadoProblemaService;
            _estadoUsuarioService = estadoUsuarioService;
            _rolService = rolService;
            _sexoService = sexoService;
            _tipoCampoService = tipoCampoService;
        }

        [HttpGet("EstadoProblema")]
        public async Task<IActionResult> ListaEstadosProblema()
        {
            var respuesta = new Response<List<EstadoProblemaDTO>>();
            try
            {
                respuesta.Estado = true;
                respuesta.Valor = await _estadoProblemaService.Lista();
            }
            catch (Exception ex)
            {
                respuesta.Estado = false;
                respuesta.Mensaje = ex.Message;
            }

            return Ok(respuesta);
        }

        [HttpGet("EstadoUsuario")]
        public async Task<IActionResult> ListaEstadosUsuarios()
        {
            var respuesta = new Response<List<EstadoUsuarioDTO>>();
            try
            {
                respuesta.Estado = true;
                respuesta.Valor = await _estadoUsuarioService.Lista();
            }
            catch (Exception ex)
            {
                respuesta.Estado = false;
                respuesta.Mensaje = ex.Message;
            }

            return Ok(respuesta);
        }

        [HttpGet("Rol")]
        public async Task<IActionResult> ListaRole()
        {
            var respuesta = new Response<List<RolDTO>>();

            try
            {
                respuesta.Estado = true;
                respuesta.Valor = await _rolService.Lista();
            }
            catch (Exception ex)
            {
                respuesta.Estado = false;
                respuesta.Mensaje = ex.Message;
            }

            return Ok(respuesta);
        }

        [HttpGet("Sexo")]
        public async Task<IActionResult> ListaSexo()
        {
            var respuesta = new Response<List<SexoDTO>>();

            try
            {
                respuesta.Estado = true;
                respuesta.Valor = await _sexoService.Lista();
            }
            catch (Exception ex)
            {
                respuesta.Estado = false;
                respuesta.Mensaje = ex.Message;
            }

            return Ok(respuesta);
        }

        [HttpGet("TipoCampo")]
        public async Task<IActionResult> ListaTipoCampo()
        {
            var respuesta = new Response<List<TipoCampoDTO>>();

            try
            {
                respuesta.Estado = true;
                respuesta.Valor = await _tipoCampoService.Lista();
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
