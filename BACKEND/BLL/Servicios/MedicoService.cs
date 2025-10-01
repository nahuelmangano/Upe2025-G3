using AutoMapper;
using BE;
using BLL.Servicios.Contrato;
using DAL.Repositorios.Contrato;
using DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios
{
    public class MedicoService : IMedicoService
    {
        private readonly IGenericRepository<Medico> _medicoRepositorio;
        private readonly IMapper _mapper;

        public MedicoService(IGenericRepository<Medico> medicoRepositorio, IMapper mapper)
        {
            _medicoRepositorio = medicoRepositorio;
            _mapper = mapper;
        }

        public async Task<List<MedicoDTO>> Lista()
        {
            try
            {
                var queryMedicos = await _medicoRepositorio.Consultar();
                var listaMedicos = queryMedicos
                    .Include(usuario => usuario.Usuario);

                return _mapper.Map<List<MedicoDTO>>(queryMedicos.ToList());
            }
            catch 
            {
                throw;
            }
        }

        public async Task<MedicoDTO> Crear(MedicoDTO modelo)
        {
            try
            {
                var medicoCreado = await _medicoRepositorio.Crear(_mapper.Map<Medico>(modelo));

                if (medicoCreado.Id == 0)
                    throw new TaskCanceledException("No se pudo crear el medico");

                var query = await _medicoRepositorio.Consultar(medico =>
                    medico.Id == medicoCreado.Id);

                medicoCreado = query
                    .Include(usuario => usuario.Usuario)
                    .First();

                return _mapper.Map<MedicoDTO>(medicoCreado);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(MedicoDTO modelo)
        {
            try
            {
                var medicoModelo = _mapper.Map<Medico>(modelo);
                var medicoEncontrado = await _medicoRepositorio.Obtener(usuario =>
                    usuario.Id == medicoModelo.Id
                );

                if (medicoEncontrado == null)
                    throw new TaskCanceledException("El medico no existe");

                medicoEncontrado.Matricula = medicoModelo.Matricula;
                medicoEncontrado.FechaVencimientoMatricula = medicoModelo.FechaVencimientoMatricula;

                bool respuesta = await _medicoRepositorio.Editar(medicoEncontrado);

                if (!respuesta)
                    throw new TaskCanceledException("No se pudo editar");

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
                var medicoEncontrado = await _medicoRepositorio.Obtener(medico =>
                medico.Id == id);

                if (medicoEncontrado == null)
                    throw new TaskCanceledException("No existe el medico");

                bool respuesta = await _medicoRepositorio.Eliminar(medicoEncontrado);

                if (!respuesta)
                    throw new TaskCanceledException("No se pudo eliminar");

                return respuesta;
            }
            catch
            {
                throw;
            }
        }
    }
}
