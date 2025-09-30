using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using BE;
using BLL.Servicios.Contrato;
using DAL.Repositorios.Contrato;
using DTOs;
using Microsoft.EntityFrameworkCore;

namespace BLL.Servicios
{
    public class PlanSaludService : IPlanSaludService
    {
        private readonly IGenericRepository<PlanSalud> _planSaludRepositorio;
        private readonly IMapper _mapper;

        public PlanSaludService(IGenericRepository<PlanSalud> planSaludRepositorio, IMapper mapper)
        {
            _planSaludRepositorio = planSaludRepositorio;
            _mapper = mapper;
        }

        public async Task<List<PlanSaludDTO>> ListaPorObraSocial(int obraSocialId)
        {
            try
            {
                var queryPlanSalud = await _planSaludRepositorio.Consultar(planSalud =>
                    planSalud.ObraSocialId == obraSocialId);

                return _mapper.Map<List<PlanSaludDTO>>(queryPlanSalud.ToList());
            }
            catch
            {
                throw;
            }
        }

        public async Task<PlanSaludDTO> Crear(PlanSaludDTO modelo)
        {
            try
            {
                var planSaludCreado = await _planSaludRepositorio.Crear(
                    _mapper.Map<PlanSalud>(modelo)
                );

                if (planSaludCreado.Id == 0)
                    throw new TaskCanceledException("No se pudo crear");

                var query = await _planSaludRepositorio.Consultar(
                    planSalud => planSalud.Id == planSaludCreado.Id
                );

                planSaludCreado = query.Include(obraSocial => obraSocial.ObraSocial).First();

                return _mapper.Map<PlanSaludDTO>(planSaludCreado);
            }
            catch
            {
                throw;
            }
        }

        public async Task<bool> Editar(PlanSaludDTO modelo)
        {
            try
            {
                var planSaludModelo = _mapper.Map<PlanSalud>(modelo);

                var planSaludEncontrado = await _planSaludRepositorio.Obtener(
                    planSalud => planSalud.Id == planSaludModelo.Id
                );

                if (planSaludEncontrado == null)
                    throw new TaskCanceledException("El plan no existe");

                planSaludEncontrado.Nombre = planSaludModelo.Nombre;
                planSaludEncontrado.ObraSocialId = planSaludModelo.ObraSocialId;

                bool respuesta = await _planSaludRepositorio.Editar(planSaludEncontrado);

                return respuesta;
            }
            catch
            {
                throw;
            }
        }
    }
}