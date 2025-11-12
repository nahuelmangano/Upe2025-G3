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

            if (string.IsNullOrWhiteSpace(mail) && string.IsNullOrWhiteSpace(passwordHash))
                throw new Exception("Debe ingresar datos!");

            else if (string.IsNullOrWhiteSpace(mail))
                throw new Exception("Debe ingresar un mail");

            else if (!Recursos.EsMailValido(mail))
                throw new Exception("Debe ingresar un mail valido");

            else if (string.IsNullOrWhiteSpace(passwordHash))
                throw new Exception("Debe ingresar un password");

            passwordHash = Recursos.ConvertirSha256(passwordHash);

            try
            {
                var queryUsuario = await _usuarioRepositorio.Consultar(usuario =>
                        usuario.Mail == mail &&
                        usuario.PasswordHash == passwordHash
                 
                );

                if (queryUsuario.FirstOrDefault() == null)
                    throw new Exception("El usuario no existe");

                Usuario devolverUsuario = queryUsuario.Include(rol => rol.Rol).First();

                if (devolverUsuario.EstadoId == 1 || devolverUsuario.EstadoId == 3 || devolverUsuario.EstadoId == 4)
                    throw new Exception("Tiene prohibido el acceso");

                //si ya esta registrado
                passwordHash = Recursos.ConvertirSha256(devolverUsuario.PasswordHash);

                return _mapper.Map<SesionDTO>(devolverUsuario);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<SesionDTO> CambiarPassword(string mail, string passwordAntigua, string nuevaPassword, string repetirNuevaPassword)
        {

            if (string.IsNullOrWhiteSpace(mail) && string.IsNullOrWhiteSpace(passwordAntigua) && string.IsNullOrWhiteSpace(nuevaPassword) && string.IsNullOrWhiteSpace(repetirNuevaPassword))
                throw new Exception("Debe ingresar datos!");

            else if (string.IsNullOrWhiteSpace(mail))
                throw new Exception("Debe ingresar un mail");

            else if (!Recursos.EsMailValido(mail))
                throw new Exception("Debe ingresar un mail valido");

            else if (string.IsNullOrWhiteSpace(passwordAntigua))
                throw new Exception("Debe ingresar la antigua password");

            else if (string.IsNullOrWhiteSpace(nuevaPassword))
                throw new Exception("Debe ingresar una nueva password");

            else if (nuevaPassword.Length < 7)
                throw new Exception("Debe ingresar una contraseña de al menos 7 caracteres");

            else if (string.IsNullOrWhiteSpace(repetirNuevaPassword))
                throw new Exception("Debe repeter la nueva password");

            else if (nuevaPassword != repetirNuevaPassword)
                throw new Exception("Las passwords ingresadas no son iguales");

            try
            {
                var buscarUsuario = await _usuarioRepositorio.Consultar(usuario =>
                usuario.Mail == mail &&
                usuario.PasswordHash == passwordAntigua);

                if (buscarUsuario.FirstOrDefault() == null)
                    throw new Exception("El usuario no existe");

                Usuario devolverUsuarioBuscado = buscarUsuario.Include(rol => rol.Rol).First();

                if (devolverUsuarioBuscado.PasswordHash != passwordAntigua)
                    throw new Exception("EL password antiguo no es correcto");

                devolverUsuarioBuscado.PasswordHash = Recursos.ConvertirSha256(nuevaPassword);
                devolverUsuarioBuscado.EstadoId = 2;

                await _usuarioRepositorio.Editar(devolverUsuarioBuscado);

                return _mapper.Map<SesionDTO>(devolverUsuarioBuscado);
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<SesionDTO> EnviarMailParaCambiarPassword(string mail)
        {
            if (string.IsNullOrWhiteSpace(mail))
                throw new Exception("Debe ingresar un mail");

            else if (!Recursos.EsMailValido(mail))
                throw new Exception("Debe ingresar un mail valido");

            try
            {
                var buscarUsuario = await _usuarioRepositorio.Consultar(usuario =>
                usuario.Mail == mail);

                if (buscarUsuario.FirstOrDefault() == null)
                    throw new Exception("El usuario no existe");

                Usuario devolverUsuarioBuscado = buscarUsuario.Include(rol => rol.Rol).First();

                if (devolverUsuarioBuscado.EstadoId == 3 || devolverUsuarioBuscado.EstadoId == 4)
                    throw new Exception("No se puede enviar el Mail porque tiene prohibido el acceso");

                devolverUsuarioBuscado.EstadoId = 1;
                devolverUsuarioBuscado.PasswordHash = Recursos.GenerarPassword();

                string asunto = "Creación de Cuenta";
                string mensajeCorreo = "<h3>Su cuenta fue creada correctamente</h3></br><p>Su contraseña para acceder es: !clave!</p>";
                mensajeCorreo = mensajeCorreo.Replace("!clave!", devolverUsuarioBuscado.PasswordHash);

                bool respuesta = Recursos.EnviarCorreo(mail, asunto, mensajeCorreo);

                await _usuarioRepositorio.Editar(devolverUsuarioBuscado);

                return _mapper.Map<SesionDTO>(devolverUsuarioBuscado);
            }
            catch (Exception)
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
                usuarioEntidad.PasswordHash = Recursos.GenerarPassword();
                usuarioEntidad.EstadoId = 1;

                string asunto = "Creación de Cuenta";
                string mensajeCorreo = "<h3>Su cuenta fue creada correctamente</h3></br><p>Su contraseña para acceder es: !clave!</p>";
                mensajeCorreo = mensajeCorreo.Replace("!clave!", usuarioEntidad.PasswordHash);

                bool respuesta = Recursos.EnviarCorreo(usuarioEntidad.Mail, asunto, mensajeCorreo);

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

                // si quiere cambiar el mail se manda una nueva password para iniciar con un nuevo mail y password
                if (modelo.Mail != usuarioEncontrado.Mail)
                {
                    usuarioEncontrado.PasswordHash = Recursos.GenerarPassword();

                    string asunto = "Cambio de Cuenta MAIL";
                    string mensajeCorreo = "<h3>Esta a 1 paso de cambiar su mail...</h3></br><p>Su contraseña para acceder es: !clave!</p>";
                    mensajeCorreo = mensajeCorreo.Replace("!clave!", usuarioEncontrado.PasswordHash);

                    Recursos.EnviarCorreo(modelo.Mail, asunto, mensajeCorreo);

                    modelo.EstadoId = 1;
                }
                usuarioEncontrado.Mail = modelo.Mail;

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