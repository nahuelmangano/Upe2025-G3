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

        // ahora que lo pienso mjor tambien hay que crud

    }
}
