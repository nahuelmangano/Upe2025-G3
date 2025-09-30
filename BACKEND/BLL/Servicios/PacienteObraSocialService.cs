using AutoMapper;
using BLL.Servicios.Contrato;
using DAL.Repositorios.Contrato;
using DTOs;
using BE;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios
{
    public class PacienteObraSocialService : IPacienteObraSocialService
    {
        private readonly IGenericRepository<PacienteObraSocial> _pacienteObraSocialRepositorio;
        private readonly IMapper _mapper;

        public PacienteObraSocialService(IGenericRepository<PacienteObraSocial> pacienteObraSocialRepositorio, IMapper mapper)
        {
            _pacienteObraSocialRepositorio = pacienteObraSocialRepositorio;
            _mapper = mapper;
        }

        public async Task<List<PacienteObraSocialDTO>> ListaPorPacienteObraSocial(int pacienteId, int obraSocialId)
        {
            try
            {
                var queryPacienteObraSocial = await _pacienteObraSocialRepositorio.Consultar(
                    paciente => paciente.PacienteId == pacienteId &&
                    paciente.ObraSocialId == obraSocialId
                );

                var lista = queryPacienteObraSocial
                    .Include(paciente => paciente.Paciente)
                    .Include(obraSocial => obraSocial.ObraSocial);

                return _mapper.Map<List<PacienteObraSocialDTO>>(lista.ToList());
            }
            catch
            {
                throw;
            }
        }

        public async Task<PacienteObraSocialDTO> Crear(PacienteObraSocialDTO modelo)
        {
            try
            {
                var pacienteObraSocialCreado = await _pacienteObraSocialRepositorio.Crear(
                    _mapper.Map<PacienteObraSocial>(modelo)
                );

                if (pacienteObraSocialCreado.Id == 0)
                    throw new TaskCanceledException("No se pudo crear");

                var query = await _pacienteObraSocialRepositorio.Consultar(
                    pacienteObraSocial => pacienteObraSocial.Id == pacienteObraSocialCreado.Id
                );

                pacienteObraSocialCreado = query
                    .Include(paciente => paciente.Paciente)
                    .Include(obraSocial => obraSocial.ObraSocial)
                    .First();

                return _mapper.Map<PacienteObraSocialDTO>(pacienteObraSocialCreado);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(PacienteObraSocialDTO modelo)
        {
            try
            {
                var pacienteObraSocialModelo = _mapper.Map<PacienteObraSocial>(modelo);

                var pacienteObraSocial = await _pacienteObraSocialRepositorio.Obtener(
                    pacienteObraSocial => pacienteObraSocial.Id == pacienteObraSocialModelo.Id
                );

                if (pacienteObraSocial == null)
                    throw new TaskCanceledException("Los valores no existen");

                pacienteObraSocial.Estado = pacienteObraSocialModelo.Estado;
                pacienteObraSocial.PacienteId = pacienteObraSocialModelo.PacienteId;
                pacienteObraSocial.ObraSocialId = pacienteObraSocialModelo.ObraSocialId;
                pacienteObraSocial.NumeroAfiliado = pacienteObraSocialModelo.NumeroAfiliado;

                bool respuesta = await _pacienteObraSocialRepositorio.Editar(pacienteObraSocial);

                return respuesta;
            }
            catch
            {
                throw;
            }
        }

    }
}