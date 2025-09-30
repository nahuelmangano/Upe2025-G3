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
    public class EstudioService : IEstudioService
    {
        private readonly IGenericRepository<Estudio> _estudioRepositorio;
        private readonly IMapper _mapper;

        public EstudioService(IGenericRepository<Estudio> estudioRepositorio, IMapper mapper)
        {
            _estudioRepositorio = estudioRepositorio;
            _mapper = mapper;
        }

        public async Task<List<EstudioDTO>> ListaPorEvolucion(int evolucionId)
        {
            var queryEstudios = await _estudioRepositorio.Consultar(
                estudio => estudio.EvolucionId == evolucionId    
            );

            return _mapper.Map<List<EstudioDTO>>(queryEstudios.ToList());  
        }

        public async Task<EstudioDTO> Crear(EstudioDTO modelo)
        {
            var estudioCreado = await _estudioRepositorio.Crear(
                    _mapper.Map<Estudio>(modelo)
                );

            if (estudioCreado.Id == 0)
                throw new TaskCanceledException("No se pudo crear");

            var query = await _estudioRepositorio.Consultar(
                estudio => estudio.Id == estudioCreado.Id
            );

            estudioCreado = query
                .Include(estudio => estudio.Evolucion)
                .Include(estudio => estudio.TipoEstudio)
                .First();

            return _mapper.Map<EstudioDTO>(estudioCreado);
        }

        public async Task<bool> Editar(EstudioDTO modelo)
        {
            try
            {
                var estudioModelo = _mapper.Map<Estudio>(modelo);

                var estudioEncontrado = await _estudioRepositorio.Obtener(
                    estudio => estudio.Id == estudioModelo.Id
                );

                if (estudioEncontrado == null)
                    throw new TaskCanceledException("El estudio no existe");

                estudioEncontrado.RealizadoPor = estudioModelo.RealizadoPor;
                estudioEncontrado.Resultado = estudioModelo.Resultado;
                estudioEncontrado.Observaciones = estudioModelo.Observaciones;
                estudioEncontrado.TipoEstudioId = estudioModelo.TipoEstudioId;
                estudioEncontrado.EvolucionId = estudioModelo.EvolucionId;

                bool respuesta = await _estudioRepositorio.Editar(estudioEncontrado);

                return respuesta;
            }
            catch
            {
                throw;
            }
        }
    }
}
