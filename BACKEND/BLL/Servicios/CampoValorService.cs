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
    public class CampoValorService : ICampoValorService
    {
        private readonly IGenericRepository<CampoValor> _campoValorRepositorio;
        private readonly IMapper _mapper;

        public CampoValorService(IGenericRepository<CampoValor> campoValorRepositorio, IMapper mapper)
        {
            _campoValorRepositorio = campoValorRepositorio;
            _mapper = mapper;
        }

        public async Task<List<CampoValorDTO>> ListaPorCampoEvolucion(int campoId, int evolucionId)
        {
            try
            {
                var queryCampoValor = await _campoValorRepositorio.Consultar(
                    campoValor => campoValor.CampoId == campoId &&
                    campoValor.EvolucionId == evolucionId
                );

                var lista = queryCampoValor
                    .Include(campo => campo.Campo)
                    .Include(evolucion => evolucion.Evolucion);

                return _mapper.Map<List<CampoValorDTO>>(lista.ToList());
            }
            catch 
            {
                throw;
            }
        }

        public async Task<CampoValorDTO> Crear(CampoValorDTO modelo)
        {
            try
            {
                var campoValorCreado = await _campoValorRepositorio.Crear(
                    _mapper.Map<CampoValor>(modelo)
                );

                if (campoValorCreado.Id == 0)
                    throw new TaskCanceledException("No se pudo crear");

                var query = await _campoValorRepositorio.Consultar(
                    campoValor => campoValor.Id == campoValorCreado.Id
                );

                campoValorCreado = query
                    .Include(campo => campo.Campo)
                    .Include(evolucion => evolucion.Evolucion)
                    .First();

                return _mapper.Map<CampoValorDTO>(campoValorCreado);    
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(CampoValorDTO modelo)
        {
            try
            {
                var campoValorModelo = _mapper.Map<CampoValor>(modelo);

                var campoValorEncontrado = await _campoValorRepositorio.Obtener(
                    campoValor => campoValor.Id == campoValorModelo.Id    
                );

                if (campoValorEncontrado == null)
                    throw new TaskCanceledException("Los valores no existen");

                campoValorEncontrado.Valor = campoValorModelo.Valor;

                bool respuesta = await _campoValorRepositorio.Editar(campoValorEncontrado);

                return respuesta;
            }
            catch
            {
                throw;
            }
        }
    }
}