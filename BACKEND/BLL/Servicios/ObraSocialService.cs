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
    public class ObraSocialService : IObraSocialService
    {
        private readonly IGenericRepository<ObraSocial> _obraSocialRepositorio;
        private readonly IMapper _mapper;

        public ObraSocialService(IGenericRepository<ObraSocial> obraSocialRepositorio, IMapper mapper)
        {
            _obraSocialRepositorio = obraSocialRepositorio;
            _mapper = mapper;
        }

        public async Task<List<ObraSocialDTO>> Lista()
        {
            try
            {
                var queryObraSocial = await _obraSocialRepositorio.Consultar();

                return _mapper.Map<List<ObraSocialDTO>>(queryObraSocial.ToList());
            }
            catch
            {
                throw;
            }
        }
        public async Task<ObraSocialDTO> Crear(ObraSocialDTO modelo)
        {
            try
            {
                var obraSocialCreada = await _obraSocialRepositorio.Crear(_mapper.Map<ObraSocial>(modelo));

                if (obraSocialCreada.Id == 0)
                    throw new TaskCanceledException("No se pudo crear la obra social");

                var query = await _obraSocialRepositorio.Consultar(obraSocial =>
                    obraSocial.Id == obraSocialCreada.Id);

                obraSocialCreada = query.First();

                return _mapper.Map<ObraSocialDTO>(obraSocialCreada);
            }
            catch
            {
                throw;
            }
        }
        public async Task<bool> Editar(ObraSocialDTO modelo)
        {
            try
            {
                var obraSocialModelo = _mapper.Map<ObraSocial>(modelo);
                var obraSocialEncontrada = await _obraSocialRepositorio.Obtener(obraSocial =>
                    obraSocial.Id == obraSocialModelo.Id
                );

                if (obraSocialEncontrada == null)
                    throw new TaskCanceledException("La obra social no existe");

                obraSocialEncontrada.Nombre = obraSocialModelo.Nombre;

                bool respuesta = await _obraSocialRepositorio.Editar(obraSocialEncontrada);

                if (!respuesta)
                    throw new TaskCanceledException("No se pudo editar");

                return respuesta;

            }
            catch
            {
                throw;
            }
        }
        public async Task<bool> Desactivar(int id)
        {
            try
            {
                var obraSocialEncontrada = await _obraSocialRepositorio.Obtener(ObraSocial =>
                ObraSocial.Id == id);

                if (obraSocialEncontrada == null)
                    throw new TaskCanceledException("No existe la obra social :<");

                obraSocialEncontrada.Activo = false;

                bool respuesta = await _obraSocialRepositorio.Editar(obraSocialEncontrada);

                if (!respuesta)
                    throw new TaskCanceledException("No se pudo eliminar");

                return respuesta;
            }
            catch
            {
                throw;
            }
        }

    }
}
