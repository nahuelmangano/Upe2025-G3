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
    }
}
