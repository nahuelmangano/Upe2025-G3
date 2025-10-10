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
    public class DomicilioService : IDomicilioService
    {
        private readonly IGenericRepository<Domicilio> _domicilioRepositorio;
        private readonly IMapper _mapper;

        public DomicilioService(IGenericRepository<Domicilio> domicilioRepositorio, IMapper mapper)
        {
            _domicilioRepositorio = domicilioRepositorio;
            _mapper = mapper;
        }

        public async Task<List<DomicilioDTO>> Lista()
        {
            try
            {
                var listaDomicilios = await _domicilioRepositorio.Consultar();
                return _mapper.Map<List<DomicilioDTO>>(listaDomicilios.ToList());
            }
            catch
            {

                throw;
            }
        }
        public async Task<DomicilioDTO> Crear(DomicilioDTO modelo)
        {
            try
            {
                var domicilioCreado = await _domicilioRepositorio.Crear(_mapper.Map<Domicilio>(modelo));

                if (domicilioCreado.Id == 0)
                    throw new TaskCanceledException("No se pudo crear el domicilio");

                var query = await _domicilioRepositorio.Consultar(domicilio =>
                    domicilio.Id == domicilioCreado.Id);

                domicilioCreado = query.First();

                return _mapper.Map<DomicilioDTO>(domicilioCreado);
            }
            catch
            {
                throw;
            }
        }
    }
}
