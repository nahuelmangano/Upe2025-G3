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
    public class ProblemaService : IProblemaService
    {
        private readonly IGenericRepository<Problema> _problemaRepositorio;
        private readonly IMapper _mapper;

        public ProblemaService(IGenericRepository<Problema> problemaRepositorio, IMapper mapper)
        {
            _problemaRepositorio = problemaRepositorio;
            _mapper = mapper;
        }

        public async Task<List<ProblemaDTO>> Lista()
        {
            try
            {
                var queryProblema = await _problemaRepositorio.Consultar();

                return _mapper.Map<List<ProblemaDTO>>(queryProblema.ToList());
            }
            catch
            {
                throw;
            }
        }

        public async Task<ProblemaDTO> Crear(ProblemaDTO modelo)
        {
            try
            {
                var problemaCreado = await _problemaRepositorio.Crear(_mapper.Map<Problema>(modelo));

                if (problemaCreado.Id == 0)
                    throw new TaskCanceledException("No se pudo crear el problema");

                var query = await _problemaRepositorio.Consultar(problema =>
                    problema.Id == problemaCreado.Id);

                return _mapper.Map<ProblemaDTO>(query);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(ProblemaDTO modelo)
        {
            try
            {
                var problemaModelo = _mapper.Map<Problema>(modelo);
                var problemaEncontrado = await _problemaRepositorio.Obtener(problema =>
                    problema.Id == problemaModelo.Id
                );

                if (problemaEncontrado == null)
                    throw new TaskCanceledException("El problema no existe");

                problemaEncontrado.Titulo = problemaModelo.Titulo;
                problemaEncontrado.Descripcion = problemaModelo.Descripcion;
                problemaEncontrado.FechaFin = problemaModelo.FechaFin;

                bool respuesta = await _problemaRepositorio.Editar(problemaEncontrado);

                if (!respuesta)
                    throw new TaskCanceledException("No se pudo editar");

                return respuesta;

            }
            catch
            {
                throw;
            }
        }
    }
}