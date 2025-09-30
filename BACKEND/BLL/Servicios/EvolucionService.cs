using AutoMapper;
using BE;
using DAL.Repositorios.Contrato;
using BLL.Servicios.Contrato;
using DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios
{
    public class EvolucionService : IEvolucionService
    {
        private readonly IGenericRepository<Evolucion> _evolucionRepositorio;
        private readonly IMapper _mapper;

        public EvolucionService(IGenericRepository<Evolucion> evolucionRepositorio, IMapper mapper)
        {
            _evolucionRepositorio = evolucionRepositorio;
            _mapper = mapper;
        }

        public async Task<List<EvolucionDTO>> ListaPorPaciente(int pacienteId)
        {
            try
            {
                var queryEvoluciones = await _evolucionRepositorio.Consultar(
                    evolucion => evolucion.PacienteId == pacienteId);
                return _mapper.Map<List<EvolucionDTO>>(queryEvoluciones.ToList());
            }
            catch
            {
                throw;
            }
        }

        public async Task<EvolucionDTO> Crear(EvolucionDTO modelo)
        {
            try
            {
                var evolucionCreada = await _evolucionRepositorio
                    .Crear(_mapper.Map<Evolucion>(modelo));

                if (evolucionCreada.Id == 0)
                    throw new TaskCanceledException("No se pudo crear");

                var query = await _evolucionRepositorio.Consultar(
                    evolucion => evolucion.Id == evolucionCreada.Id
                );

                evolucionCreada = query
                    .Include(estudio => estudio.EstadoProblema)
                    .Include(estudio => estudio.Medico)
                    .Include(estudio => estudio.Paciente)
                    .Include(estudio => estudio.Plantilla)
                    .Include(estudio => estudio.Problema)
                    .First();

                return _mapper.Map<EvolucionDTO>(evolucionCreada);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(EvolucionDTO modelo)
        {
            try
            {
                var evolucionModelo = _mapper.Map<Evolucion>(modelo);

                var evolucionEncontrada = await _evolucionRepositorio.Obtener(
                    evolucion => evolucion.Id == evolucionModelo.Id
                );

                if (evolucionEncontrada == null)
                    throw new TaskCanceledException("La evolucion no existe");

                evolucionEncontrada.Descripcion = evolucionModelo.Descripcion;
                evolucionEncontrada.DiagnosticoDefinitivo = evolucionModelo.DiagnosticoDefinitivo;
                evolucionEncontrada.PlantillaId = evolucionModelo.PlantillaId;
                evolucionEncontrada.ProblemaId = evolucionModelo.ProblemaId;
                evolucionEncontrada.EstadoProblemaId = evolucionModelo.EstadoProblemaId;

                bool respuesta = await _evolucionRepositorio.Editar(evolucionEncontrada);

                return respuesta;
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Eliminar(int id)
        {
            try
            {
                var evolucionEncontrada = await _evolucionRepositorio.Obtener(
                    evolucion => evolucion.Id == id
                );

                if (evolucionEncontrada == null)
                    throw new TaskCanceledException("La evolucion no existe");

                bool respuesta = await _evolucionRepositorio.Eliminar(evolucionEncontrada);

                return respuesta;
            }
            catch
            {
                throw;
            }
        }
    }
}
