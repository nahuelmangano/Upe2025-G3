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
    }
}
