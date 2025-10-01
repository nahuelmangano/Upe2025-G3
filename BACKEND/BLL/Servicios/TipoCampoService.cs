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
    public class TipoCampoService : ITipoCampoService
    {
        private readonly IGenericRepository<TipoCampo> _tipoCampoRepositorio;
        private readonly IMapper _mapper;

        public TipoCampoService(IGenericRepository<TipoCampo> tipoCampoRepositorio, IMapper mapper)
        {
            _tipoCampoRepositorio = tipoCampoRepositorio;
            _mapper = mapper;
        }

        public async Task<List<TipoCampoDTO>> Lista()
        {
            try
            {
                var listaTipoCampos = await _tipoCampoRepositorio.Consultar();
                return _mapper.Map<List<TipoCampoDTO>>(listaTipoCampos.ToList());
            }
            catch
            {

                throw;
            }
        }

    }
}