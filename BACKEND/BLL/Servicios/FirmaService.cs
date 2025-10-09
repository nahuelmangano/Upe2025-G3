using AutoMapper;
using BE;
using BLL.Servicios.Contrato;
using DAL.Repositorios.Contrato;
using DTOs;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios
{
    public class FirmaService : IFirmaService
    {
        private readonly IGenericRepository<FirmaDigital> _firmaRepositorio;
        private readonly IMapper _mapper;

        public FirmaService(IGenericRepository<FirmaDigital> firmaRepositorio, IMapper mapper)
        {
            _firmaRepositorio = firmaRepositorio;
            _mapper = mapper;
        }

        public async Task<List<FirmaDigitalDTO>> ListaPorMedico(int medicoId)
        {
            try
            {
                var queryFirmas = await _firmaRepositorio.Consultar(
                    firma => firma.MedicoId == medicoId);

                return _mapper.Map<List<FirmaDigitalDTO>>(queryFirmas.ToList());
            }
            catch
            {
                throw;
            }
        }

        public async Task<FirmaDigitalDTO> Crear(FirmaDigitalDTO modelo)
        {
            try
            {
                var firmaCreada = await _firmaRepositorio.Crear(
                    _mapper.Map<FirmaDigital>(modelo)
                );

                if (firmaCreada.Id == 0)
                    throw new TaskCanceledException("No se pudo crear");

                var query = await _firmaRepositorio.Consultar(
                    firma => firma.Id == firmaCreada.Id
                );

                firmaCreada = query.Include(medico => medico.Medico).First();

                return _mapper.Map<FirmaDigitalDTO>(firmaCreada);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(FirmaDigitalDTO modelo)
        {
            try
            {
                var firmaModelo = _mapper.Map<FirmaDigital>(modelo);

                var firmaEncontrada = await _firmaRepositorio.Obtener(
                    firma => firma.Id == firmaModelo.Id
                );

                if (firmaEncontrada == null)
                    throw new TaskCanceledException("La firma no existe");

                firmaEncontrada.Algoritmo = firmaModelo.Algoritmo;
                firmaEncontrada.Firma = firmaModelo.Firma;
                firmaEncontrada.HashDocumento = firmaModelo.HashDocumento;
                firmaEncontrada.Valido = firmaModelo.Valido;

                bool respuesta = await _firmaRepositorio.Editar(firmaEncontrada);

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
                var firmaEncontrada = await _firmaRepositorio.Obtener(
                    firma => firma.Id == id
                );

                if (firmaEncontrada == null)
                    throw new TaskCanceledException("La firma no existe");

                firmaEncontrada.Valido = false;

                bool respuesta = await _firmaRepositorio.Editar(firmaEncontrada);

                return respuesta;
            }
            catch
            {
                throw;
            }
        }
    }
}