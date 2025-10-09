using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using BLL.Servicios.Contrato;
using DAL.Repositorios.Contrato;
using DTOs;
using BE;
using Microsoft.EntityFrameworkCore;

namespace BLL.Servicios
{
    public class ArchivoAdjuntoService : IArchivoAdjuntoService
    {
        private readonly IGenericRepository<ArchivoAdjunto> _archivoAdjuntoRepositorio;
        private readonly IMapper _mapper;

        public ArchivoAdjuntoService(IGenericRepository<ArchivoAdjunto> archivoAdjuntoRepositorio, IMapper mapper)
        {
            _archivoAdjuntoRepositorio = archivoAdjuntoRepositorio;
            _mapper = mapper;
        }

        public async Task<List<ArchivoAdjuntoDTO>> ListaPorEstudio(int estudioId)
        {
            try
            {
                var queryArchivos = await _archivoAdjuntoRepositorio.Consultar(archivo =>
                    archivo.EstudioId == estudioId);
                // usar include en un futuro para obtneer mas datos del estudio si se requiere
                return _mapper.Map<List<ArchivoAdjuntoDTO>>(queryArchivos.ToList());
            }
            catch
            {
                throw;
            }
        }

        public async Task<ArchivoAdjuntoDTO> Crear(ArchivoAdjuntoDTO modelo)
        {
            try
            {
                var archivoCreado = await _archivoAdjuntoRepositorio.Crear(
                    _mapper.Map<ArchivoAdjunto>(modelo)
                );

                if (archivoCreado.Id == 0)
                    throw new TaskCanceledException("No se pudo crear");

                var query = await _archivoAdjuntoRepositorio.Consultar(
                    archivo => archivo.Id == archivoCreado.Id
                );

                archivoCreado = query.Include(estudio => estudio.Estudio).First();

                return _mapper.Map<ArchivoAdjuntoDTO>(archivoCreado);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(ArchivoAdjuntoDTO modelo)
        {
            try
            {
                var archivoModelo = _mapper.Map<ArchivoAdjunto>(modelo);

                var archivoEncontrado = await _archivoAdjuntoRepositorio.Obtener(
                    archivo => archivo.Id == archivoModelo.Id
                );

                if (archivoEncontrado == null)
                    throw new TaskCanceledException("El archvio no existe");

                archivoEncontrado.NombreArchivo = archivoModelo.NombreArchivo;
                archivoEncontrado.EstudioId = archivoModelo.EstudioId;
                // no hay nada mas que se podria editar creo yo, quizas habria q volar este metodo
                bool respuesta = await _archivoAdjuntoRepositorio.Editar(archivoEncontrado);

                return respuesta;
            }
            catch
            {
                throw;
            }
        }

        public Task<Stream> Descargar(int id)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> Desactivar(int id)
        {
            try
            {
                var archivoEncontrado = await _archivoAdjuntoRepositorio.Obtener(
                    archivo => archivo.Id == id
                );

                archivoEncontrado.Activo = false;

                if (archivoEncontrado == null)
                    throw new TaskCanceledException("El archivo no existe");
            
                bool respuesta = await _archivoAdjuntoRepositorio.Editar(archivoEncontrado);

                return respuesta;
            }
            catch
            {
                throw;
            }
        }
    }
}