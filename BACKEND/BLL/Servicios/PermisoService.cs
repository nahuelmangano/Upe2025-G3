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
    public class PermisoService : IPermisoService
    {
        private readonly IGenericRepository<Permiso> _permisoRepositorio;
        private readonly IMapper _mapper;

        public PermisoService(IGenericRepository<Permiso> permisoRepositorio, IMapper mapper)
        {
            _permisoRepositorio = permisoRepositorio;
            _mapper = mapper;
        }

        public async Task<List<PermisoDTO>> Lista()
        {
            try
            {
                var queryPermisos = await _permisoRepositorio.Consultar();

                return _mapper.Map<List<PermisoDTO>>(queryPermisos.ToList());
            }
            catch
            {
                throw;
            }
        }
    }
}