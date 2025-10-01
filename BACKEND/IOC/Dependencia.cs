using BE;
using BLL.Servicios;
using BLL.Servicios.Contrato;
using DAL.DBContext;
using DAL.Repositorios;
using DAL.Repositorios.Contrato;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using Utility;

namespace IOC
{
    public static class Dependencia
    {
        // Metodo de Extencion
        public static void InyectarDependencias(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<DbUpeclinicaContext>(options =>
            {
                options.UseSqlServer(configuration.GetConnectionString("cadenaSQL"));
            });

            services.AddTransient(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped<IEvolucionRepository, EvolucionRepository>();

            services.AddAutoMapper(typeof(AutoMapperProfile));
            // implementacion de los servicios

            services.AddScoped<IArchivoAdjuntoService, ArchivoAdjuntoService>();
            services.AddScoped<ICampoService, CampoService>();
            services.AddScoped<ICampoValorService, CampoValorService>();
            services.AddScoped<IDomicilioService, DomicilioService>();
            services.AddScoped<IEspecialidadService, EspecialidadService>();
            services.AddScoped<IEstadoProblemaService, EstadoProblemaService>();
            services.AddScoped<IEstadoUsuarioService, EstadoUsuarioService>();
            services.AddScoped<IEstudioService, EstudioService>();
            services.AddScoped<IEvolucionService, EvolucionService>();
            services.AddScoped<IFirmaService, FirmaService>();
            services.AddScoped<IMedicoService, MedicoService>();
            services.AddScoped<IObraSocialService, ObraSocialService>();
            services.AddScoped<IPacienteObraSocialService, PacienteObraSocialService>();
            services.AddScoped<IPacienteService, PacienteService>();
            services.AddScoped<IPermisoService, PermisoService>();
            services.AddScoped<IPlanSaludService, PlanSaludService>();
            services.AddScoped<IPlantillaServicie, PlantillaServicie>();
            services.AddScoped<IProblemaService, ProblemaService>();
            services.AddScoped<IRolPermisoService, RolPermisoService>();
            services.AddScoped<IRolService, RolService>();
            services.AddScoped<ISexoService, SexoService>();
            services.AddScoped<ITipoCampoService, TipoCampoService>();
            services.AddScoped<ITipoEstudioService, TipoEstudioService>();
            services.AddScoped<IUsuarioService, UsuarioService>();

        }
    }
}
