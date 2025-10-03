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

        public async Task<PermisoDTO>Crear(PermisoDTO modelo)
        {
            var permisoCreado = await _permisoRepositorio.Crear(_mapper.Map<Permiso>(modelo));
            if(permisoCreado.Id == 0)
            {
                throw new TaskCanceledException("No se pudo crear el permiso");
            }

            return _mapper.Map<PermisoDTO>(permisoCreado);
        }

        
        public async Task<bool> Editar(PermisoDTO modelo)
        {
            try
            {
                var permisoModelo = _mapper.Map<Permiso>(modelo);
                var permisoEncontrado = await _permisoRepositorio.Obtener(p =>
                    p.Id == permisoModelo.Id
                );

                if (permisoEncontrado == null)
                {
                    throw new TaskCanceledException("El permiso no existe");
                }
                    

                permisoEncontrado.Nombre = permisoModelo.Nombre;
                permisoEncontrado.Descripcion = permisoModelo.Descripcion;

                bool respuesta = await _permisoRepositorio.Editar(permisoEncontrado);

                if (!respuesta)
                    throw new TaskCanceledException("No se pudo editar");

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
                var permisoEncontrado = await _permisoRepositorio.Obtener(p =>
                    p.Id == id
                );

                if (permisoEncontrado == null)
                {
                    throw new TaskCanceledException("El permiso no existe");
                }
                bool respuesta = await _permisoRepositorio.Eliminar(permisoEncontrado);

                if(!respuesta)
                {
                    throw new TaskCanceledException("No se pudo eliminar el permiso");
                }

                return respuesta;
            }
            catch
            {
                throw;
            }
        }
    }
}