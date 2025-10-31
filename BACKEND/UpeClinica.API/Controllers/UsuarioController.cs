using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioService _usuarioServicio;

        public UsuarioController(IUsuarioService usuarioServicio)
        {
            _usuarioServicio = usuarioServicio;
        }

        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            var rsp = new Response<List<UsuarioDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _usuarioServicio.Lista();
            }
            catch (Exception ex)
            {
                rsp.Estado = false;
                rsp.Mensaje = ex.Message;
            }

            return Ok(rsp);
        }

        [HttpPost]
        [Route("IniciarSesion")]
        public async Task<IActionResult> IniciarSesion([FromBody] LoginDTO login)
        {
            var rsp = new Response<SesionDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _usuarioServicio.ValidarCredenciales(login.Mail, login.PasswordHash);
            }
            catch (Exception ex)
            {
                rsp.Estado = false;
                rsp.Mensaje = ex.Message;
            }

            return Ok(rsp);
        }
        /// <summary>
        /// Falta que al crearlo asigne el ultimo accesso
        /// </summary>
        /// <param name="usuario"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("Crear")]
        public async Task<IActionResult> Crear([FromBody] UsuarioCrearDTO usuario)
        {
            var rsp = new Response<UsuarioDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _usuarioServicio.Crear(usuario);
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
        public async Task<IActionResult> Editar([FromBody] UsuarioEditarDTO usuario)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _usuarioServicio.Editar(usuario);
            }
            catch (Exception ex)
            {
                rsp.Estado = false;
                rsp.Mensaje = ex.Message;
            }

            return Ok(rsp);
        }
        /// <summary>
        /// La elimina posta
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPut]
        [Route("Eliminar/{id:int}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _usuarioServicio.Desactivar(id);
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