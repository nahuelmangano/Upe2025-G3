using AutoMapper;
using BE;
using DAL.Repositorios.Contrato;
using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios
{
    public class TipoEstudioService
    {
        private readonly IGenericRepository<TipoEstudio> _tipoEstudioRepositorio;
        private readonly IMapper _mapper;

        public TipoEstudioService(IGenericRepository<TipoEstudio> tipoEstudioRepositorio, IMapper mapper)
        {
            _tipoEstudioRepositorio = tipoEstudioRepositorio;
            _mapper = mapper;
        }

        public async Task<List<TipoEstudioDTO>> Lista()
        {
            try
            {
                var queryEstados = await _tipoEstudioRepositorio.Consultar();

                return _mapper.Map<List<TipoEstudioDTO>>(queryEstados.ToList());
            }
            catch
            {
                throw;
            }
        }
    }
}