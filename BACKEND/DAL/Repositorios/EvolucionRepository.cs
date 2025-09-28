using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL.DBContext;
using DAL.Repositorios.Contrato;
using BE;

namespace DAL.Repositorios
{
    public class EvolucionRepository : GenericRepository<Evolucion>, IEvolucionRepository
    {
        // Logica para crear evolucion con linq
        private readonly DbUpeclinicaContext _dbcontext;

        public EvolucionRepository(DbUpeclinicaContext dbcontext) : base(dbcontext)
        {
            _dbcontext = dbcontext;
        }

        public Task<Evolucion> Generar(Evolucion modelo)
        {
            throw new NotImplementedException();
        }
    }
}
