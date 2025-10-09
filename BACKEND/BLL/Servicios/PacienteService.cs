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
    public class PacienteService : IPacienteService
    {
        private readonly IGenericRepository<Paciente> _pacienteRepositorio;
        private readonly IMapper _mapper;

        public PacienteService(IGenericRepository<Paciente> pacienteRepositorio, IMapper mapper)
        {
            _pacienteRepositorio = pacienteRepositorio;
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

        public async Task<bool> Desactivar(int id)
        {
            try
            {
                var pacienteEncontrado = await _pacienteRepositorio.Obtener(paciente =>
                paciente.Id == id);

                if (pacienteEncontrado == null)
                    throw new TaskCanceledException("No existe el paciente :<");

                pacienteEncontrado.Activo = false;

                bool respuesta = await _pacienteRepositorio.Editar(pacienteEncontrado);

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
