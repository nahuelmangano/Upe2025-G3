using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FirmaController : ControllerBase
    {
        private readonly IFirmaService _firmaServicio;

        public FirmaController(IFirmaService firmaServicio)
        {
            _firmaServicio = firmaServicio;
        }

        [HttpGet]
        [Route("ListaPorMedico/{medicoId:int}")]
        public async Task<IActionResult> ListaPorMedico(int medicoId)
        {
            var rsp = new Response<List<FirmaDigitalDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _firmaServicio.ListaPorMedico(medicoId);
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
        public async Task<IActionResult> Crear([FromBody] FirmaDigitalDTO firma)
        {
            var rsp = new Response<FirmaDigitalDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _firmaServicio.Crear(firma);
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
        public async Task<IActionResult> Editar([FromBody] FirmaDigitalDTO firma)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _firmaServicio.Editar(firma);
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
                rsp.Valor = await _firmaServicio.Eliminar(id);
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
