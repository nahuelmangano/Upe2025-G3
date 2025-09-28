using BE;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositorios.Contrato
{
    public interface IEvolucionRepository : IGenericRepository<Evolucion>
    {
        Task<Evolucion> Generar(Evolucion modelo);
    }
}
