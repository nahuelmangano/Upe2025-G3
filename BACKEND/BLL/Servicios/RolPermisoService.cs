using AutoMapper;
using BLL.Servicios.Contrato;
using DAL.Repositorios.Contrato;
using DTOs;
using BE;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios
{
    public class RolPermisoService : IRolPermisoService
    {
        private readonly IGenericRepository<RolPermiso> _rolPermisoRepositorio;
        private readonly IMapper _mapper;

        public RolPermisoService(IGenericRepository<RolPermiso> rolPermisoRepositorio, IMapper mapper)
        {
            _rolPermisoRepositorio = rolPermisoRepositorio;
            _mapper = mapper;
        }

        public async Task<List<RolPermisoDTO>> ListaPorRolPermiso(int rolId, int permisoId)
        {
            try
            {
                var queryRolPermisoValor = await _rolPermisoRepositorio.Consultar(
                    rolPermiso => rolPermiso.RolId == rolId &&
                    rolPermiso.PermisoId == permisoId
                );

                var lista = queryRolPermisoValor
                    .Include(rol => rol.Rol)
                    .Include(permiso => permiso.Permiso);

                return _mapper.Map<List<RolPermisoDTO>>(lista.ToList());
            }
            catch
            {
                throw;
            }
        }

        public async Task<RolPermisoDTO> Crear(RolPermisoDTO modelo)
        {
            try
            {
                var rolPermisoCreado = await _rolPermisoRepositorio.Crear(
                    _mapper.Map<RolPermiso>(modelo)
                );

                if (rolPermisoCreado.Id == 0)
                    throw new TaskCanceledException("No se pudo crear");

                var query = await _rolPermisoRepositorio.Consultar(
                    rolPermiso => rolPermiso.Id == rolPermisoCreado.Id
                );

                rolPermisoCreado = query
                    .Include(rol => rol.Rol)
                    .Include(permiso => permiso.Permiso)
                    .First();

                return _mapper.Map<RolPermisoDTO>(rolPermisoCreado);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(RolPermisoDTO modelo)
        {
            try
            {
                var rolPermisoModelo = _mapper.Map<RolPermiso>(modelo);

                var rolPermisoEncontrado = await _rolPermisoRepositorio.Obtener(
                    rolPermiso => rolPermiso.Id == rolPermisoModelo.Id
                );

                if (rolPermisoEncontrado == null)
                    throw new TaskCanceledException("Los valores no existen");

                rolPermisoEncontrado.RolId = rolPermisoModelo.RolId;
                rolPermisoEncontrado.PermisoId = rolPermisoModelo.PermisoId;
                // no se me ocurre otra cossA

                bool respuesta = await _rolPermisoRepositorio.Editar(rolPermisoEncontrado);

                return respuesta;
            }
            catch
            {
                throw;
            }
        }
    }
}
