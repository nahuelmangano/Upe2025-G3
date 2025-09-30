
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
    public class CampoService : ICampoService
    {
        private readonly IGenericRepository<Campo> _campoRepositorio;
        private readonly IMapper _mapper;

        public CampoService(IGenericRepository<Campo> campoRepositorio, IMapper mapper)
        {
            _campoRepositorio = campoRepositorio;
            _mapper = mapper;
        }

        public async Task<List<CampoDTO>> ListaPorPlantilla(int plantillaId)
        {
            try
            {
                var queryCampos = await _campoRepositorio.Consultar(
                    campo => campo.PlantillaId == plantillaId    
                );

                return _mapper.Map<List<CampoDTO>>(queryCampos.ToList());
            }
            catch
            {
                throw;
            }
        }

        public async Task<CampoDTO> Crear(CampoDTO modelo)
        {
            try
            {
                var campoCreado = await _campoRepositorio.Crear(
                    _mapper.Map<Campo>(modelo)    
                );

                if (campoCreado.Id == 0)
                    throw new TaskCanceledException("No se pudo crear");

                var query = await _campoRepositorio.Consultar(
                    campo => campo.Id == campoCreado.Id
                );

                campoCreado = query
                    .Include(plantilla => plantilla.Plantilla)
                    .Include(tipoCampo => tipoCampo.TipoCampo)
                    .First(); // luego probar con FirstAsync

                return _mapper.Map<CampoDTO>(campoCreado);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(CampoDTO modelo)
        {
            try
            {
                var campoModelo = _mapper.Map<Campo>(modelo);

                var campoEncontrado = await _campoRepositorio.Obtener(
                    campo => campo.Id == campoModelo.Id
                );

                if (campoEncontrado == null)
                    throw new TaskCanceledException("El campo no existe");

                campoEncontrado.Etiqueta = campoModelo.Etiqueta;
                campoEncontrado.Obligatorio = campoModelo.Obligatorio;
                campoEncontrado.Opciones = campoModelo.Opciones;
                campoEncontrado.Orden = campoModelo.Orden;
                campoEncontrado.TipoCampoId = campoModelo.TipoCampoId;
                campoEncontrado.PlantillaId = campoModelo.PlantillaId;

                bool respuesta = await _campoRepositorio.Editar( campoEncontrado );

                return respuesta;
            }
            catch
            {
                throw;
            }
        }

        //aun no se sabe si seria mejor agregar un estadoId
        public async Task<bool> Eliminar(int id)
        {
            try
            {
                var campoEncontrado = await _campoRepositorio.Obtener(
                    campo => campo.Id == id
                );

                if(campoEncontrado == null )
                    throw new TaskCanceledException("El campo no existe");
            
                bool respuesta = await _campoRepositorio.Eliminar( campoEncontrado );

                return respuesta;
            }
            catch
            {
                throw;
            }
        }
    }
}