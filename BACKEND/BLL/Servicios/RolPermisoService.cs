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
        private readonly IGenericRepository<Permiso> _permiso;
        private readonly IMapper _mapper;

        public RolPermisoService(IGenericRepository<RolPermiso> rolPermisoRepositorio, IGenericRepository<Permiso> permiso, IMapper mapper)
        {
            _rolPermisoRepositorio = rolPermisoRepositorio;
            _permiso = permiso;
            _mapper = mapper;
        }

        public async Task<List<RolPermisoDTO>> Lista()
        {
            try
            {
                var queryRolPermisoValor = await _rolPermisoRepositorio.Consultar();

                var lista = queryRolPermisoValor
                    .Include(rol => rol.Rol)
                    .Include(permiso => permiso.Permiso)
                    .Where(rol => rol.Rol.Id != 1);

                return _mapper.Map<List<RolPermisoDTO>>(lista.ToList());
            }
            catch
            {
                throw;
            }
        }

        public async Task<RolPermisoDTO> Crear(RolPermisoCrearDTO modelo)
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

        public async Task<bool> Editar(RolPermisoEditarDTO modelo)
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

                var permisoEncontrado = await _permiso.Obtener(
                    permiso => permiso.Id == rolPermisoEncontrado.PermisoId
                    );

                if( permisoEncontrado == null)
                    throw new TaskCanceledException("No se pudo encontrar el permiso");
                permisoEncontrado.Activo = modelo.Activo;

                await _permiso.Editar( permisoEncontrado );

                bool respuesta = await _rolPermisoRepositorio.Editar(rolPermisoEncontrado);

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
                var rolPermisoEncontrado = await _rolPermisoRepositorio.Obtener(rolPermiso =>
                rolPermiso.Id == id);

                if (rolPermisoEncontrado == null)
                    throw new TaskCanceledException("No existe el permiso para el rol");

                bool respuesta = await _rolPermisoRepositorio.Eliminar(rolPermisoEncontrado);

                if (!respuesta)
                    throw new TaskCanceledException("No se pudo eliminar");

                return respuesta;

            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
