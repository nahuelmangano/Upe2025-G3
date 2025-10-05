using AutoMapper;
using BE;
using BLL.Servicios.Contrato;
using DAL.Repositorios.Contrato;
using DTOs;
using Microsoft.Data.SqlClient.DataClassification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios
{
    public class TipoEstudioService : ITipoEstudioService
    {
        private readonly IGenericRepository<TipoEstudio> _tipoEstudioRepositorio;
        private readonly IMapper _mapper;

        public TipoEstudioService(IGenericRepository<TipoEstudio> tipoEstudioRepositorio, IMapper mapper)
        {
            _tipoEstudioRepositorio = tipoEstudioRepositorio;
            _mapper = mapper;
        }

        public async Task<List<TipoEstudioDTO>> Lista()
        {
            try
            {
                var queryEstados = await _tipoEstudioRepositorio.Consultar();

                return _mapper.Map<List<TipoEstudioDTO>>(queryEstados.ToList());
            }
            catch
            {
                throw;
            }
        }

        public async Task<TipoEstudioDTO> Crear(TipoEstudioDTO modelo)
        {
            var tipoEstudioCreado = await _tipoEstudioRepositorio.Crear(_mapper.Map<TipoEstudio>(modelo));
            if(tipoEstudioCreado.Id == 0)
            {
                throw new TaskCanceledException("No se pudo crear el tipo de estudio");
            }

            return _mapper.Map<TipoEstudioDTO>(tipoEstudioCreado);
        }

        public async Task<bool> Editar(TipoEstudioDTO modelo)
        {
            try
            {
                var tipoEstudioModelo = _mapper.Map<TipoEstudio>(modelo);
                var tipoEstudioEncontrado = await _tipoEstudioRepositorio.Obtener(t => t.Id == tipoEstudioModelo.Id);

                if (tipoEstudioEncontrado.Id == 0)
                {
                    throw new TaskCanceledException("El tipo de estudio no existe");
                }

                tipoEstudioEncontrado.Nombre = tipoEstudioModelo.Nombre;
                tipoEstudioEncontrado.Estudios = tipoEstudioModelo.Estudios;

                bool respuesta = await _tipoEstudioRepositorio.Editar(tipoEstudioEncontrado);

                if (!respuesta)
                {
                    throw new TaskCanceledException("No se puedo editar el tipo de estudio");
                }

                return respuesta;
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool>Eliminar(int id)
        {
            try
            {
                var tipoEstudioEncontrado = await _tipoEstudioRepositorio.Obtener(t => t.Id == id);

                if (tipoEstudioEncontrado == null)
                {
                    throw new TaskCanceledException("El tipo de estudio no existe");
                }
                bool respuesta = await _tipoEstudioRepositorio.Eliminar(tipoEstudioEncontrado);

                if (!respuesta)
                {
                    throw new TaskCanceledException("No se pudo eliminar el tipo de estudio");
                }
                return respuesta;
            }catch
            {
                throw ;
            }
        }

    }
}