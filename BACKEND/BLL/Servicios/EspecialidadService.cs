using AutoMapper;
using BE;
using BLL.Servicios.Contrato;
using DAL.Repositorios.Contrato;
using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios
{
    public class EspecialidadService : IEspecialidadService
    {
        private readonly IGenericRepository<Especialidad> _especialidadRepositorio;
        private readonly IMapper _mapper;

        public EspecialidadService(IGenericRepository<Especialidad> especialidadRepositorio, IMapper mapper)
        {
            _especialidadRepositorio = especialidadRepositorio;
            _mapper = mapper;
        }

        public async Task<List<EspecialidadDTO>> Lista()
        {
            try
            {
                var listaEspecialidades = await _especialidadRepositorio.Consultar();
                return _mapper.Map<List<EspecialidadDTO>>(listaEspecialidades.ToList());
            }
            catch
            {
                throw;
            }
        }

        public async Task<EspecialidadDTO> ObtenerPorIdAsync(int id)
        {
            try
            {
                if (id <= 0)
                    throw new ArgumentException("El ID debe ser mayor que cero", nameof(id));

                var especialidad = await _especialidadRepositorio.Obtener(x => x.Id == id);
                if (especialidad == null)
                    return null;

                return _mapper.Map<EspecialidadDTO>(especialidad);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al obtener la especialidad con ID {id}: {ex.Message}", ex);
            }
        }

        public async Task<EspecialidadDTO> CrearAsync(EspecialidadDTO especialidad)
        {
            try
            {
                if (especialidad == null)
                    throw new ArgumentNullException(nameof(especialidad));

                if (string.IsNullOrWhiteSpace(especialidad.Nombre))
                    throw new ArgumentException("El nombre de la especialidad es requerido", nameof(especialidad));

                var especialidadEntity = _mapper.Map<Especialidad>(especialidad);
                var especialidadCreada = await _especialidadRepositorio.Crear(especialidadEntity);
                
                return _mapper.Map<EspecialidadDTO>(especialidadCreada);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al crear la especialidad: {ex.Message}", ex);
            }
        }

        public async Task<EspecialidadDTO> ActualizarAsync(int id, EspecialidadDTO especialidad)
        {
            try
            {
                if (id <= 0)
                    throw new ArgumentException("El ID debe ser mayor que cero", nameof(id));

                if (especialidad == null)
                    throw new ArgumentNullException(nameof(especialidad));

                if (string.IsNullOrWhiteSpace(especialidad.Nombre))
                    throw new ArgumentException("El nombre de la especialidad es requerido", nameof(especialidad));

                var especialidadExistente = await _especialidadRepositorio.Obtener(x => x.Id == id);
                if (especialidadExistente == null)
                    return null;

                var especialidadEntity = _mapper.Map<Especialidad>(especialidad);
                especialidadEntity.Id = id;
                
                var actualizada = await _especialidadRepositorio.Editar(especialidadEntity);
                
                if (actualizada)
                    return _mapper.Map<EspecialidadDTO>(especialidadEntity);
                else
                    throw new Exception("No se pudo actualizar la especialidad");
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al actualizar la especialidad con ID {id}: {ex.Message}", ex);
            }
        }

        public async Task<bool> DesactivarAsync(int id)
        {
            try
            {
                if (id <= 0)
                    throw new ArgumentException("El ID debe ser mayor que cero", nameof(id));

                var especialidadExistente = await _especialidadRepositorio.Obtener(x => x.Id == id);
                
                if (especialidadExistente == null)
                    return false;

                especialidadExistente.Activo = false;

                return await _especialidadRepositorio.Editar(especialidadExistente);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error al eliminar la especialidad con ID {id}: {ex.Message}", ex);
            }
        }

    }
}
