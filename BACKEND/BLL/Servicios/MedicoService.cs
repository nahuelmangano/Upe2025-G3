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
        private readonly IGenericRepository<Usuario> _usuarioRepositorio;
        private readonly IMapper _mapper;

        public MedicoService(IGenericRepository<Medico> medicoRepositorio, IGenericRepository<Usuario> usuarioRepositorio, IMapper mapper)
        {
            _medicoRepositorio = medicoRepositorio;
            _usuarioRepositorio = usuarioRepositorio;
            _mapper = mapper;
        }

        public async Task<List<MedicoDTO>> Lista()
        {
            try
            {
                var queryMedicos = await _medicoRepositorio.Consultar();
                var listaMedicos = queryMedicos
                    .Include(usuario => usuario.Usuario)
                    .Include(usuario => usuario.Usuario.Estado)
                    .Include(usuario => usuario.Usuario.Rol)
                    .ToList();

                return _mapper.Map<List<MedicoDTO>>(queryMedicos);
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

        public async Task<bool> Desactivar(int id)
        {
            try
            {
                var medicoEncontrado = await _medicoRepositorio
                    .Obtener(
                        medico =>
                        medico.Id == id
                    );

                if (medicoEncontrado == null)
                    throw new TaskCanceledException("No existe el medico");

                var usuarioEncontrado = await _usuarioRepositorio
                    .Obtener(
                        u => 
                        u.Id == medicoEncontrado.UsuarioId
                    );
                
                if (usuarioEncontrado == null)
                    throw new TaskCanceledException("No existe el medico");

                usuarioEncontrado.EstadoId = 3;

                bool respuesta = await _medicoRepositorio.Editar(medicoEncontrado);

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
