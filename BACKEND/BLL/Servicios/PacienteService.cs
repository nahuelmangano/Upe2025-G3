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
using System.Globalization;

namespace BLL.Servicios
{
    public class PacienteService : IPacienteService
    {
        private readonly IGenericRepository<Paciente> _pacienteRepositorio;
        private readonly IGenericRepository<Evolucion> _evolucionRepositorio;
        private readonly IMapper _mapper;

        public PacienteService(IGenericRepository<Paciente> pacienteRepositorio,
            IGenericRepository<Evolucion> evolucionRepositorio,
            IMapper mapper)
        {
            _pacienteRepositorio = pacienteRepositorio;
            _evolucionRepositorio = evolucionRepositorio;
            _mapper = mapper;
        }

        public async Task<List<PacienteDTO>> Lista()
        {
            try
            {
                var queryPaciente = await _pacienteRepositorio.Consultar();
                var listaUsuarios = queryPaciente
                    .Include(sexo => sexo.Sexo)
                    .Include(domicilio => domicilio.Domicilio)
                    .ToList();

                return _mapper.Map<List<PacienteDTO>>(listaUsuarios);
            }
            catch
            {
                throw;
            }
        }

        public async Task<PacienteDTO> Crear(PacienteDTO modelo)
        {
            try
            {
                var pacienteCreado = await _pacienteRepositorio.Crear(_mapper.Map<Paciente>(modelo));

                if (pacienteCreado.Id == 0)
                    throw new TaskCanceledException("No se pudo crear el paciente");

                var query = await _pacienteRepositorio.Consultar(usuario =>
                    usuario.Id == pacienteCreado.Id);

                pacienteCreado = query
                    .Include(sexo => sexo.Sexo)
                    .Include(domicilio => domicilio.Domicilio)
                    .First();

                return _mapper.Map<PacienteDTO>(pacienteCreado);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(PacienteDTO modelo)
        {
            try
            {
                var pacienteModelo = _mapper.Map<Paciente>(modelo);
                var pacienteEncontrado = await _pacienteRepositorio.Obtener(paciente =>
                    paciente.Id == pacienteModelo.Id
                );

                if (pacienteEncontrado == null)
                    throw new TaskCanceledException("El usuario no existe");

                pacienteEncontrado.Nombre = pacienteModelo.Nombre;
                pacienteEncontrado.Apellido = pacienteModelo.Apellido;
                pacienteEncontrado.Email = pacienteModelo.Email;
                pacienteEncontrado.Nacionalidad = pacienteModelo.Nacionalidad;
                pacienteEncontrado.Ocupacion = pacienteModelo.Ocupacion;
                pacienteEncontrado.Telefono1 = pacienteModelo.Telefono1;
                pacienteEncontrado.Telefono2 = pacienteModelo.Telefono2;
                pacienteEncontrado.DomicilioId = pacienteModelo.DomicilioId;
                pacienteEncontrado.SexoId = pacienteModelo.SexoId;

                bool respuesta = await _pacienteRepositorio.Editar(pacienteEncontrado);

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
                var pacienteEncontrado = await _pacienteRepositorio.Obtener(paciente =>
                paciente.Id == id);

                if (pacienteEncontrado == null)
                    throw new TaskCanceledException("No existe el paciente :<");

                bool respuesta = await _pacienteRepositorio.Eliminar(pacienteEncontrado);

                if (!respuesta)
                    throw new TaskCanceledException("No se pudo eliminar");

                return respuesta;
            }
            catch
            {
                throw;
            }
        }

        public async Task<ResumenPacienteDTO> ObtenerResumen(int pacienteId)
        {
            try
            {
                var query = await _evolucionRepositorio.Consultar(e => e.PacienteId == pacienteId);
                var evoluciones = await query
                    .Include(e => e.Problema)
                    .Include(e => e.EstadoProblema)
                    .OrderByDescending(e => e.FechaConsulta)
                    .ToListAsync();

                if (!evoluciones.Any())
                {
                    return new ResumenPacienteDTO();
                }

                var resumen = new ResumenPacienteDTO
                {
                    Evoluciones = evoluciones
                        .Select(e => new ResumenEvolucionDTO
                        {
                            Fecha = e.FechaConsulta.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture),
                            Hora = e.FechaConsulta.ToString("HH:mm 'hs'", CultureInfo.InvariantCulture),
                            Titulo = e.Problema?.Titulo ?? e.DiagnosticoInicial,
                            Descripcion = string.IsNullOrWhiteSpace(e.Descripcion) ? e.DiagnosticoInicial : e.Descripcion
                        })
                        .ToList(),
                    Problemas = evoluciones
                        .Where(e => e.Problema != null)
                        .GroupBy(e => e.ProblemaId)
                        .Select(g =>
                        {
                            var evolucionReciente = g.OrderByDescending(ev => ev.FechaConsulta).First();
                            var problema = evolucionReciente.Problema!;
                            var estadoNombre = evolucionReciente.EstadoProblema?.Nombre;

                            bool activoSegunEstado = estadoNombre != null &&
                                estadoNombre.Equals("Activo", StringComparison.OrdinalIgnoreCase);

                            bool activoSegunFechas = !problema.FechaFin.HasValue || problema.FechaFin >= DateTime.Today;

                            var descripcionProblema = string.IsNullOrWhiteSpace(problema.Descripcion)
                                ? problema.Titulo ?? string.Empty
                                : problema.Descripcion;

                            return new ResumenProblemaDTO
                            {
                                Titulo = descripcionProblema ?? string.Empty,
                                Tipo = problema.Titulo ?? string.Empty,
                                Activo = activoSegunEstado || activoSegunFechas
                            };
                        })
                        .OrderByDescending(p => p.Activo)
                        .ThenBy(p => p.Titulo)
                        .ToList()
                };

                return resumen;
            }
            catch
            {
                throw;
            }
        }

    }
}
