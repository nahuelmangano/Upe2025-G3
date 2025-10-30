using AutoMapper;
using BE;
using BLL.Servicios.Contrato;
using DAL.Repositorios.Contrato;
using DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IGenericRepository<Usuario> _usuarioRepositorio;
        private readonly IGenericRepository<Medico> _medicoRepositorio;
        private readonly IMapper _mapper;

        public UsuarioService(IGenericRepository<Usuario> usuarioRepositorio, IGenericRepository<Medico> medicoRepositorio, IMapper mapper)
        {
            _usuarioRepositorio = usuarioRepositorio;
            _medicoRepositorio = medicoRepositorio;
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
                    .Include(estado => estado.Medico)
                    .ToList();

                if (!listaUsuarios.Any())
                    throw new Exception("No hay usuarios registrados");

                return _mapper.Map<List<UsuarioDTO>>(listaUsuarios);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<SesionDTO> ValidarCredenciales(string mail, string passwordHash)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(mail) && string.IsNullOrWhiteSpace(passwordHash))
                    throw new Exception("Debe ingresar datos!");

                else if (string.IsNullOrWhiteSpace(mail))
                    throw new Exception("Debe ingresar un mail");

                else if (!Recursos.EsMailValido(mail))
                    throw new Exception("Debe ingresar un mail valido");

                else if (string.IsNullOrWhiteSpace(passwordHash))
                    throw new Exception("Debe ingresar un password");

                passwordHash = Recursos.ConvertirSha256(passwordHash);

                var queryUsuario = await _usuarioRepositorio.Consultar(usuario =>
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

        public async Task<UsuarioDTO> Crear(UsuarioCrearDTO modelo)
        {

            if (string.IsNullOrWhiteSpace(modelo.Nombre))
                throw new Exception("Debe ingresar un nombre");

            else if (modelo.Nombre.Length < 2)
                throw new Exception("Debe ingresar un nombre valido");

            else if (string.IsNullOrWhiteSpace(modelo.Apellido))
                throw new Exception("Debe ingresar un apellido");

            else if (modelo.Apellido.Length < 2)
                throw new Exception("Debe ingresar un apellido valido");

            else if (string.IsNullOrWhiteSpace(modelo.Mail))
                throw new Exception("Debe ingresar un mail");

            else if (!Recursos.EsMailValido(modelo.Mail))
                throw new Exception("Debe ingresar un mail valido");

            else if (string.IsNullOrWhiteSpace(modelo.PasswordHash))
                throw new Exception("Debe ingresar una password");

            else if (modelo.PasswordHash.Length < 7)
                throw new Exception("Debe ingresar una contraseña de al menos 7 caracteres");

            else if (string.IsNullOrWhiteSpace(modelo.RolId.ToString()))
                throw new Exception("Debe ingresar un rol");

            if (modelo.RolId == 2)
            {
                if (string.IsNullOrWhiteSpace(modelo.Matricula) || string.IsNullOrWhiteSpace(modelo.FechaVencimientoMatricula))
                    throw new Exception("Debe ingresar los datos de Matricula y Fecha si el usuario es un Medico");

                if (!DateTime.TryParse(modelo.FechaVencimientoMatricula, out DateTime fechaVencimiento))
                    throw new Exception("Fecha de vencimiento inválida");

                if (fechaVencimiento.Date <= DateTime.Today)
                    throw new Exception("La fecha de vencimiento debe ser mayor al día de hoy");
            }

            try
            {
                var usuarioEntidad = _mapper.Map<Usuario>(modelo);
                usuarioEntidad.PasswordHash = Recursos.ConvertirSha256(modelo.PasswordHash);
                usuarioEntidad.EstadoId = 2;

                var usuarioCreado = await _usuarioRepositorio.Crear(usuarioEntidad);

                if (usuarioCreado.Id == 0)
                    throw new TaskCanceledException("No se pudo crear el Usuario");

                if (modelo.RolId == 2)
                {
                    // si ingreso datos del medico
                    if (!string.IsNullOrEmpty(modelo.Matricula) && !string.IsNullOrEmpty(modelo.FechaVencimientoMatricula))
                    {
                        var medico = new Medico
                        {
                            Matricula = modelo.Matricula,
                            // deberia de ingresar año/mes/dia
                            FechaVencimientoMatricula = DateOnly.Parse(modelo.FechaVencimientoMatricula),
                            UsuarioId = usuarioCreado.Id
                        };

                        await _medicoRepositorio.Crear(medico);
                    }
                }

                var query = await _usuarioRepositorio.Consultar(usuario =>
                usuario.Id == usuarioCreado.Id);

                usuarioCreado = query
                    .Include(rol => rol.Rol)
                    .Include(estado => estado.Estado)
                    .Include(estado => estado.Medico)
                    .First();

                return _mapper.Map<UsuarioDTO>(usuarioCreado);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Editar(UsuarioEditarDTO modelo)
        {
            if (string.IsNullOrWhiteSpace(modelo.Nombre))
                throw new Exception("Debe ingresar un nombre");

            else if (modelo.Nombre.Length < 2)
                throw new Exception("Debe ingresar un nombre valido");

            else if (string.IsNullOrWhiteSpace(modelo.Apellido))
                throw new Exception("Debe ingresar un apellido");

            else if (modelo.Apellido.Length < 2)
                throw new Exception("Debe ingresar un apellido valido");

            else if (string.IsNullOrWhiteSpace(modelo.Mail))
                throw new Exception("Debe ingresar un mail");

            else if (!Recursos.EsMailValido(modelo.Mail))
                throw new Exception("Debe ingresar un mail valido");

            else if (string.IsNullOrWhiteSpace(modelo.PasswordHash))
                throw new Exception("Debe ingresar una password");

            else if (modelo.PasswordHash.Length < 7)
                throw new Exception("Debe ingresar una contraseña de al menos 7 caracteres");

            else if (string.IsNullOrWhiteSpace(modelo.RolId.ToString()))
                throw new Exception("Debe ingresar un rol");


            // Si el usuario es un medico los campos matricula y fecha de vencimiento de la misma deben ser obligatorios
            DateOnly fechaVencimiento = default;
            if (modelo.RolId == 2)
            {
                if (string.IsNullOrWhiteSpace(modelo.Matricula) || string.IsNullOrWhiteSpace(modelo.FechaVencimientoMatricula))
                    throw new Exception("Debe ingresar los datos de Matricula y Fecha si el usuario es un Medico");
                
                if (!DateOnly.TryParseExact(modelo.FechaVencimientoMatricula, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out fechaVencimiento))
                    throw new Exception("Fecha de vencimiento inválida");
                
                if (fechaVencimiento.ToDateTime(new TimeOnly(0, 0)).Date <= DateTime.Today) throw new Exception("La fecha de vencimiento debe ser mayor al día de hoy");
            }

            try
            {
                var usuarioModelo = _mapper.Map<Usuario>(modelo);
                var usuarioEncontrado = await _usuarioRepositorio.Obtener(usuario =>
                    usuario.Id == usuarioModelo.Id
                );

                if (usuarioEncontrado == null)
                    throw new TaskCanceledException("El usuario no existe");


                if (usuarioEncontrado.RolId != modelo.RolId)
                    throw new Exception("No se puede editar el rol");

                // Editar
                usuarioEncontrado.Nombre = modelo.Nombre;
                usuarioEncontrado.Apellido = modelo.Apellido;
                usuarioEncontrado.Mail = modelo.Mail;
                if (!string.IsNullOrWhiteSpace(modelo.PasswordHash))
                    usuarioEncontrado.PasswordHash = Recursos.ConvertirSha256(modelo.PasswordHash);
                if (modelo.EstadoId.HasValue)
                    usuarioEncontrado.EstadoId = modelo.EstadoId.Value;

                bool respuesta = await _usuarioRepositorio.Editar(usuarioEncontrado);

                if (!respuesta)
                    throw new TaskCanceledException("No se pudo editar");

                // si es medico editar sus valores
                if (modelo.RolId == 2)
                {
                    var medico = await _medicoRepositorio.Obtener(m => m.UsuarioId == usuarioEncontrado.Id);
                    if (medico == null)
                    {
                        medico = new Medico { UsuarioId = usuarioEncontrado.Id };
                        await _medicoRepositorio.Crear(medico);
                    }
                    medico.Matricula = modelo.Matricula;
                    medico.FechaVencimientoMatricula = fechaVencimiento;
                    await _medicoRepositorio.Editar(medico);
                }

                return respuesta;
            }
            catch (Exception)
            {
                throw;
            }

        }


        public async Task<bool> Desactivar(int id)
        {
            try
            {
                var usuarioEncontrado = await _usuarioRepositorio.Obtener(usuario =>
                usuario.Id == id);

                if (usuarioEncontrado == null)
                    throw new TaskCanceledException("No existe el usuario");

                usuarioEncontrado.EstadoId = 3;

                bool respuesta = await _usuarioRepositorio.Editar(usuarioEncontrado);

                if (!respuesta)
                    throw new TaskCanceledException("No se pudo editar");

                return respuesta;

            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}