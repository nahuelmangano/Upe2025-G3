using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlantillaController : ControllerBase
    {
        private readonly IPlantillaServicie _plantillaServicio;

        public PlantillaController(IPlantillaServicie plantillaServicio)
        {
            _plantillaServicio = plantillaServicio;
        }

        [HttpGet]
        [Route("ListaPorMedico/{medicoId:int}")]
        public async Task<IActionResult> ListaPorMedico(int medicoId)
        {
            var rsp = new Response<List<PlantillaDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _plantillaServicio.ListaPorMedico(medicoId);
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
        public async Task<IActionResult> Crear([FromBody] PlantillaDTO plantilla)
        {
            var rsp = new Response<PlantillaDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _plantillaServicio.Crear(plantilla);
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
        public async Task<IActionResult> Editar([FromBody] PlantillaDTO plantilla)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _plantillaServicio.Editar(plantilla);
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