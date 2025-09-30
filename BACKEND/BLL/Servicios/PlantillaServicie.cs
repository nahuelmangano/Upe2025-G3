using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using BE;
using BLL.Servicios.Contrato;
using DAL.Repositorios.Contrato;
using DTOs;
using Microsoft.EntityFrameworkCore;

namespace BLL.Servicios
{
    public class PlantillaServicie : IPlantillaServicie
    {
        private readonly IGenericRepository<Plantilla> _plantillaRepositorio;
        private readonly IMapper _mapper;

        public PlantillaServicie(IGenericRepository<Plantilla> plantillaRepositorio, IMapper mapper)
        {
            _plantillaRepositorio = plantillaRepositorio;
            _mapper = mapper;
        }

        public async Task<List<PlantillaDTO>> ListaPorMedico(int medicoId)
        {
            try
            {
                var queryPlantillas = await _plantillaRepositorio.Consultar(plantilla =>
                    plantilla.MedicoId == medicoId);

                return _mapper.Map<List<PlantillaDTO>>(queryPlantillas.ToList());
            }
            catch
            {
                throw;
            }
        }

        public async Task<PlantillaDTO> Crear(PlantillaDTO modelo)
        {
            try
            {
                var plantillaCreada = await _plantillaRepositorio.Crear(
                    _mapper.Map<Plantilla>(modelo)
                );

                if (plantillaCreada.Id == 0)
                    throw new TaskCanceledException("No se pudo crear");

                var query = await _plantillaRepositorio.Consultar(
                    plantilla => plantilla.Id == plantillaCreada.Id
                );

                plantillaCreada = query.Include(medico => medico.Medico).First();

                return _mapper.Map<PlantillaDTO>(plantillaCreada);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(PlantillaDTO modelo)
        {
            try
            {
                var plantillaModelo = _mapper.Map<Plantilla>(modelo);

                var plantillaEncontrada = await _plantillaRepositorio.Obtener(
                    plantilla => plantilla.Id == plantillaModelo.Id
                );

                if (plantillaEncontrada == null)
                    throw new TaskCanceledException("La plantilla no existe");

                plantillaEncontrada.Activo = plantillaModelo.Activo;
                plantillaEncontrada.Descripcion = plantillaModelo.Descripcion;
                plantillaEncontrada.Nombre = plantillaModelo.Nombre;
                plantillaEncontrada.Medico = plantillaModelo.Medico;

                bool respuesta = await _plantillaRepositorio.Editar(plantillaEncontrada);

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
                var plantillaEncontrada = await _plantillaRepositorio.Obtener(
                    plantilla => plantilla.Id == id
                );

                if (plantillaEncontrada == null)
                    throw new TaskCanceledException("La plantilla no existe");

                bool respuesta = await _plantillaRepositorio.Eliminar(plantillaEncontrada);

                return respuesta;
            }
            catch
            {
                throw;
            }
        }
    }
}