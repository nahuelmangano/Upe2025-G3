using BE;
using DAL.Repositorios.Contrato;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;
using BLL.Servicios.Contrato;
using DTOs;


namespace BLL.Servicios
{
    public class EstadoProblemaService : IEstadoProblemaService
    {
        private readonly IGenericRepository<EstadoProblema> _estadoProblemaRepositorio;
        private readonly IMapper _mapper;

        public EstadoProblemaService(IGenericRepository<EstadoProblema> estadoProblemaRepositorio, IMapper mapper)
        {
            _estadoProblemaRepositorio = estadoProblemaRepositorio;
            _mapper = mapper;
        }

        public async Task<List<EstadoProblemaDTO>> Lista()
        {
            try
            {
                var queryEstados = await _estadoProblemaRepositorio.Consultar();
                
                return _mapper.Map<List<EstadoProblemaDTO>>(queryEstados.ToList());
            }
            catch
            {
                throw;
            }
        }
    }
}