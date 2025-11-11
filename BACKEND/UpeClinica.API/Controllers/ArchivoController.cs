using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Linq;

using BLL.Servicios.Contrato;
using DTOs;
using UpeClinica.API.Utilidad;

namespace UpeClinica.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArchivoController : ControllerBase
    {
        private readonly IArchivoAdjuntoService _archivoServicio;

        public ArchivoController(IArchivoAdjuntoService archivoService)
        {
            this._archivoServicio = archivoService;
        }

        [HttpGet]
        [Route("ListaPorEstudio/{estudioId:int}")]
        public async Task<IActionResult> ListaPorEstudio(int estudioId)
        {
            var rsp = new Response<List<ArchivoAdjuntoDTO>>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _archivoServicio.ListaPorEstudio(estudioId);
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
        public async Task<IActionResult> Crear([FromBody] ArchivoAdjuntoDTO archivo)
        {
            var rsp = new Response<ArchivoAdjuntoDTO>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _archivoServicio.Crear(archivo);
            }
            catch (Exception ex)
            {
                rsp.Estado = false;
                rsp.Mensaje = ex.Message;
            }

            return Ok(rsp);
        }

        // Sube un archivo al file system y persiste metadatos
        [HttpPost]
        [Route("Subir")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Subir(IFormFile archivo, [FromForm] int estudioId)
        {
            var rsp = new Response<ArchivoAdjuntoDTO>();

            try
            {
                var file = archivo ?? Request?.Form?.Files?.FirstOrDefault();
                if (file == null || file.Length == 0)
                    throw new Exception("El archivo es requerido o está vacío");

                var config = HttpContext.RequestServices.GetService(typeof(IConfiguration)) as IConfiguration;
                var root = config?["Storage:RootPath"] ?? "/data/upeclinica/files";

                var ext = Path.GetExtension(file.FileName);
                var name = $"{Guid.NewGuid()}{ext}";
                var rel = Path.Combine("estudios", estudioId.ToString(), DateTime.UtcNow.ToString("yyyy"), DateTime.UtcNow.ToString("MM"), name).Replace("\\", "/");
                var abs = Path.Combine(root, rel);

                var dir = Path.GetDirectoryName(abs)!;
                if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
                using (var fs = new FileStream(abs, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    await file.CopyToAsync(fs);
                }

                var dto = new ArchivoAdjuntoDTO
                {
                    EstudioId = estudioId,
                    NombreArchivo = file.FileName,
                    Tamano = (int)Math.Min(int.MaxValue, file.Length),
                    Url = rel,
                    FechaSubida = DateTime.UtcNow.ToString("dd/MM/yyyy"),
                    Activo = 1
                };

                rsp.Estado = true;
                rsp.Valor = await _archivoServicio.Crear(dto);
            }
            catch (Exception ex)
            {
                rsp.Estado = false;
                rsp.Mensaje = ex.Message;
            }

            return Ok(rsp);
        }

        [HttpGet]
        [Route("Descargar/{id:int}")]
        public async Task<IActionResult> Descargar(int id)
        {
            try
            {
                var dto = await _archivoServicio.Obtener(id);
                if (dto == null) return NotFound();
                var config = HttpContext.RequestServices.GetService(typeof(IConfiguration)) as IConfiguration;
                var root = config?["Storage:RootPath"] ?? "/data/upeclinica/files";
                var abs = Path.Combine(root, dto.Url ?? string.Empty);
                if (!System.IO.File.Exists(abs)) return NotFound();
                var contentType = "application/octet-stream";
                return PhysicalFile(abs, contentType, dto.NombreArchivo);
            }
            catch (Exception ex)
            {
                return BadRequest(new { estado = false, mensaje = ex.Message });
            }
        }

        [HttpPut]
        [Route("Editar")]
        public async Task<IActionResult> Editar([FromBody] ArchivoAdjuntoDTO archivo)
        {
            var rsp = new Response<bool>();

            try
            {
                rsp.Estado = true;
                rsp.Valor = await _archivoServicio.Editar(archivo);
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
                rsp.Valor = await _archivoServicio.Desactivar(id);
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
