using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;
using System;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EspecialidadController : ControllerBase
    {
        private readonly IEspecialidadService _especialidadServicio;
        private readonly ILogger<EspecialidadController> _logger;

        public EspecialidadController(IEspecialidadService especialidadServicio, ILogger<EspecialidadController> logger)
        {
            _especialidadServicio = especialidadServicio;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene todas las especialidades
        /// </summary>
        /// <returns>Lista de especialidades</returns>
        [HttpGet]
        [Route("Lista")]
        public async Task<IActionResult> Lista()
        {
            var respuesta = new Response<List<EspecialidadDTO>>();

            try
            {
                _logger.LogInformation("Obteniendo todas las especialidades");
                respuesta.Estado = true;
                respuesta.Valor = await _especialidadServicio.Lista();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todas las especialidades");
                respuesta.Estado = false;
                respuesta.Mensaje = ex.Message;
            }

            return Ok(respuesta);
        }

        /// <summary>
        /// Obtiene una especialidad por su ID
        /// </summary>
        /// <param name="id">ID de la especialidad</param>
        /// <returns>Especialidad encontrada</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var respuesta = new Response<EspecialidadDTO>();

            try
            {
                _logger.LogInformation("Obteniendo especialidad con ID: {Id}", id);
                var especialidad = await _especialidadServicio.ObtenerPorIdAsync(id);
                
                if (especialidad == null)
                {
                    _logger.LogWarning("Especialidad con ID {Id} no encontrada", id);
                    respuesta.Estado = false;
                    respuesta.Mensaje = $"Especialidad con ID {id} no encontrada";
                    return NotFound(respuesta);
                }

                respuesta.Estado = true;
                respuesta.Valor = especialidad;
                return Ok(respuesta);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Argumento inválido para obtener especialidad con ID: {Id}", id);
                respuesta.Estado = false;
                respuesta.Mensaje = ex.Message;
                return BadRequest(respuesta);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener especialidad con ID: {Id}", id);
                respuesta.Estado = false;
                respuesta.Mensaje = "Error interno del servidor";
                return StatusCode(500, respuesta);
            }
        }

        /// <summary>
        /// Crea una nueva especialidad
        /// </summary>
        /// <param name="especialidad">Datos de la especialidad a crear</param>
        /// <returns>Especialidad creada</returns>
        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] EspecialidadDTO especialidad)
        {
            var respuesta = new Response<EspecialidadDTO>();

            try
            {
                _logger.LogInformation("Creando nueva especialidad: {Nombre}", especialidad?.Nombre);
                var especialidadCreada = await _especialidadServicio.CrearAsync(especialidad);
                
                respuesta.Estado = true;
                respuesta.Valor = especialidadCreada;
                return CreatedAtAction(nameof(ObtenerPorId), new { id = especialidadCreada.Id }, respuesta);
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogWarning(ex, "Datos de especialidad nulos al crear");
                respuesta.Estado = false;
                respuesta.Mensaje = "Los datos de la especialidad son requeridos";
                return BadRequest(respuesta);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Datos inválidos al crear especialidad");
                respuesta.Estado = false;
                respuesta.Mensaje = ex.Message;
                return BadRequest(respuesta);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear especialidad");
                respuesta.Estado = false;
                respuesta.Mensaje = "Error interno del servidor";
                return StatusCode(500, respuesta);
            }
        }

        /// <summary>
        /// Actualiza una especialidad existente
        /// </summary>
        /// <param name="id">ID de la especialidad a actualizar</param>
        /// <param name="especialidad">Nuevos datos de la especialidad</param>
        /// <returns>Especialidad actualizada</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] EspecialidadDTO especialidad)
        {
            var respuesta = new Response<EspecialidadDTO>();

            try
            {
                _logger.LogInformation("Actualizando especialidad con ID: {Id}", id);
                var especialidadActualizada = await _especialidadServicio.ActualizarAsync(id, especialidad);
                
                if (especialidadActualizada == null)
                {
                    _logger.LogWarning("Especialidad con ID {Id} no encontrada para actualizar", id);
                    respuesta.Estado = false;
                    respuesta.Mensaje = $"Especialidad con ID {id} no encontrada";
                    return NotFound(respuesta);
                }

                respuesta.Estado = true;
                respuesta.Valor = especialidadActualizada;
                return Ok(respuesta);
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogWarning(ex, "Datos de especialidad nulos al actualizar ID: {Id}", id);
                respuesta.Estado = false;
                respuesta.Mensaje = "Los datos de la especialidad son requeridos";
                return BadRequest(respuesta);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Datos inválidos al actualizar especialidad con ID: {Id}", id);
                respuesta.Estado = false;
                respuesta.Mensaje = ex.Message;
                return BadRequest(respuesta);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar especialidad con ID: {Id}", id);
                respuesta.Estado = false;
                respuesta.Mensaje = "Error interno del servidor";
                return StatusCode(500, respuesta);
            }
        }

        /// <summary>
        /// Elimina una especialidad
        /// </summary>
        /// <param name="id">ID de la especialidad a eliminar</param>
        /// <returns>Resultado de la operación</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var respuesta = new Response<bool>();

            try
            {
                _logger.LogInformation("Eliminando especialidad con ID: {Id}", id);
                var eliminada = await _especialidadServicio.EliminarAsync(id);
                
                if (!eliminada)
                {
                    _logger.LogWarning("Especialidad con ID {Id} no encontrada para eliminar", id);
                    respuesta.Estado = false;
                    respuesta.Mensaje = $"Especialidad con ID {id} no encontrada";
                    return NotFound(respuesta);
                }

                respuesta.Estado = true;
                respuesta.Valor = true;
                respuesta.Mensaje = "Especialidad eliminada correctamente";
                return Ok(respuesta);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Argumento inválido para eliminar especialidad con ID: {Id}", id);
                respuesta.Estado = false;
                respuesta.Mensaje = ex.Message;
                return BadRequest(respuesta);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar especialidad con ID: {Id}", id);
                respuesta.Estado = false;
                respuesta.Mensaje = "Error interno del servidor";
                return StatusCode(500, respuesta);
            }
        }
    }
}
