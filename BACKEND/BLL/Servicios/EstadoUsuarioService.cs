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

namespace BLL.Servicios
{
    public class EstadoUsuarioService : IEstadoUsuarioService
    {
        private readonly IGenericRepository<EstadoUsuario> _estadoUsuarioRepositorio;
        private readonly IMapper _mapper;

        public EstadoUsuarioService(IGenericRepository<EstadoUsuario> estadoUsuarioRepositorio, IMapper mapper)
        {
            _estadoUsuarioRepositorio = estadoUsuarioRepositorio;
            _mapper = mapper;
        }

        public async Task<List<EstadoUsuarioDTO>> Lista()
        {
            try
            {
                var queryEstados = await _estadoUsuarioRepositorio.Consultar();

                return _mapper.Map<List<EstadoUsuarioDTO>>(queryEstados.ToList());
            }
            catch
            {
                throw;
            }
        }
    }
}