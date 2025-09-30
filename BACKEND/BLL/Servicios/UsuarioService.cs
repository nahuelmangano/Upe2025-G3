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
    public class UsuarioService : IUsuarioService
    {
        private readonly IGenericRepository<Usuario> _usuarioRepositorio;
        private readonly IMapper _mapper;

        public UsuarioService(IGenericRepository<Usuario> usuarioRepositorio, IMapper mapper)
        {
            _usuarioRepositorio = usuarioRepositorio;
            _mapper = mapper;
        }

        public async Task<List<UsuarioDTO>> Lista()
        {
            try
            {
                var queryUsuario = await _usuarioRepositorio.Consultar();
                var listaUsuarios = queryUsuario
                    .Include(rol => rol.Rol)
                    .Include(estado => estado.Estado)
                    .ToList();

                return _mapper.Map<List<UsuarioDTO>>(listaUsuarios);
            }
            catch
            {
                throw;
            }
        }

        public async Task<SesionDTO> ValidarCredenciales(string mail, string passwordHash)
        {
            try
            {
                var queryUsuario = await _usuarioRepositorio.Consultar( usuario => 
                    usuario.Mail == mail &&
                    usuario.PasswordHash == passwordHash
                );

                if (queryUsuario.FirstOrDefault() == null)
                    throw new TaskCanceledException("El usuario no existe");

                Usuario devolverUsuario = queryUsuario.Include(rol => rol.Rol).First();

                return _mapper.Map<SesionDTO>(devolverUsuario);
            }
            catch
            {
                throw;
            }
        }

        public async Task<UsuarioDTO> Crear(UsuarioDTO modelo)
        {
            try
            {
                var usuarioCreado = await _usuarioRepositorio.Crear(_mapper.Map<Usuario>(modelo));

                if (usuarioCreado.Id == 0)
                    throw new TaskCanceledException("No se pudo crear el Usuario");

                var query = await _usuarioRepositorio.Consultar(usuario =>
                    usuario.Id == usuarioCreado.Id);

                usuarioCreado = query
                    .Include(rol => rol.Rol)
                    .Include(estado => estado.Estado)
                    .First();

                return _mapper.Map<UsuarioDTO>(usuarioCreado);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(UsuarioDTO modelo)
        {
            try
            {
                var usuarioModelo = _mapper.Map<Usuario>(modelo);
                var usuarioEncontrado= await _usuarioRepositorio.Obtener(usuario => 
                    usuario.Id == usuarioModelo.Id
                );

                if (usuarioEncontrado == null)
                    throw new TaskCanceledException("El usuario no existe");

                usuarioEncontrado.Nombre = usuarioModelo.Nombre;
                usuarioEncontrado.Apellido = usuarioModelo.Apellido;
                usuarioEncontrado.Mail = usuarioModelo.Mail;
                usuarioEncontrado.EstadoId = usuarioModelo.EstadoId;
                usuarioEncontrado.RolId = usuarioModelo.RolId;

                bool respuesta = await _usuarioRepositorio.Editar(usuarioEncontrado);

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
                var usuarioEncontrado = await _usuarioRepositorio.Obtener(usuario =>
                usuario.Id == id);

                if (usuarioEncontrado == null)
                    throw new TaskCanceledException("No existe el Usuario");
                
                bool respuesta = await _usuarioRepositorio.Eliminar(usuarioEncontrado);

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