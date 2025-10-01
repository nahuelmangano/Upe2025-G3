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
    public class SexoService : ISexoService
    {
        private readonly IGenericRepository<Sexo> _sexoRepositorio;
        private readonly IMapper _mapper;

        public SexoService(IGenericRepository<Sexo> sexoRepositorio, IMapper mapper)
        {
            _sexoRepositorio = sexoRepositorio;
            _mapper = mapper;
        }

        public async Task<List<SexoDTO>> Lista()
        {
            try
            {
                var listaSexos = await _sexoRepositorio.Consultar();
                return _mapper.Map<List<SexoDTO>>(listaSexos.ToList());
            }
            catch
            {

                throw;
            }
        }
    }
}
