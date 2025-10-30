using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DTOs;
using BE;

namespace Utility
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {

            #region ArchivoAdjunto
            CreateMap<ArchivoAdjunto, ArchivoAdjuntoDTO>()
                .ForMember(destino =>
                destino.EstudioTipoNombre,
                opt => opt.MapFrom(origen => origen.Estudio.TipoEstudio.Nombre)
                )
                .ForMember(destino =>
                destino.FechaSubida,
                opt => opt.MapFrom(origen => origen.FechaSubida.ToString("dd/MM/yyyy"))
                )
                .ForMember(destino =>
                destino.Activo,
                opt => opt.MapFrom(origen => origen.Activo == true ? 1 : 0)
                );
            CreateMap<ArchivoAdjuntoDTO, ArchivoAdjunto>()
                .ForMember(destino =>
                    destino.Estudio,
                    opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.Activo,
                opt => opt.MapFrom(origen => origen.Activo == 1 ? true : false)
                );
            #endregion ArchivoAdjunto

            #region Campo
            CreateMap<Campo, CampoDTO>()
                .ForMember(destino =>
                    destino.TipoCampoNombre,
                    opt => opt.MapFrom(origen => origen.TipoCampo.Nombre)
                )
                .ForMember(destino =>
                    destino.PlantillaNombre,
                    opt => opt.MapFrom(origen => origen.Plantilla.Nombre)
                )
                .ForMember(destino =>
                destino.Activo,
                opt => opt.MapFrom(origen => origen.Activo == true ? 1 : 0)
                )
                .ReverseMap() // dto a modelo
                .ForMember(destino =>
                    destino.Plantilla,
                    opt => opt.Ignore()
                )
                .ForMember(destino =>
                    destino.TipoCampo,
                    opt => opt.Ignore()
                )
                .ForMember(destino =>
                    destino.CampoValors,
                    opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.Activo,
                opt => opt.MapFrom(origen => origen.Activo == 1 ? true : false)
                );

            #endregion Campo

            #region CampoValor
            CreateMap<CampoValor, CampoValorDTO>()
                .ForMember(destino =>
                    destino.CampoEtiqueta,
                    opt => opt.MapFrom(origen => origen.Campo.Etiqueta)
                )
                .ForMember(destino =>
                    destino.EvolucionDescripcion,
                    opt => opt.MapFrom(origen => origen.Evolucion.Descripcion)
                )
                .ReverseMap()
                .ForMember(destino =>
                    destino.Campo,
                    opt => opt.Ignore()
                )
                .ForMember(destino =>
                    destino.Evolucion,
                    opt => opt.Ignore()
                );
            #endregion CampoValor

            #region Domicilio
            CreateMap<Domicilio, DomicilioDTO>()
                .ReverseMap()
                .ForMember(destino =>
                destino.Pacientes,
                opt => opt.Ignore()
                );
            #endregion Domicilio

            #region Especialidad
            CreateMap<Especialidad, EspecialidadDTO>()
                .ForMember(destino =>
                destino.Activo,
                opt => opt.MapFrom(origen => origen.Activo == true ? 1 : 0)
                )
                .ReverseMap()
                .ForMember(destino =>
                destino.Medicos,
                opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.Activo,
                opt => opt.MapFrom(origen => origen.Activo == 1 ? true : false)
                );
            #endregion Especialidad

            #region EstadoProblema
            CreateMap<EstadoProblema, EstadoProblemaDTO>()
                .ReverseMap()
                .ForMember(destino =>
                destino.Evolucions,
                opt => opt.Ignore()
                );
            #endregion EstadoProblema

            #region EstadoUsuario
            CreateMap<EstadoUsuario, EstadoUsuarioDTO>()
                .ReverseMap()
                .ForMember(destino =>
                destino.Usuarios,
                opt => opt.Ignore()
                );
            #endregion EstadoUsuario

            #region Estudio
            CreateMap<Estudio, EstudioDTO>()
                .ForMember(destino =>
                destino.Fecha,
                opt => opt.MapFrom(origen => origen.Fecha.ToString("dd/MM/yyyy"))
                )
                .ForMember(destino =>
                destino.TipoEstudioNombre,
                opt => opt.MapFrom(origen => origen.TipoEstudio.Nombre)
                )
                .ForMember(destino =>
                destino.EvolucionDescripcion,
                opt => opt.MapFrom(origen => origen.Evolucion.Descripcion)
                )
                .ReverseMap()
                .ForMember(destino =>
                    destino.ArchivoAdjuntos,
                    opt => opt.Ignore()
                )
                .ForMember(destino =>
                    destino.Evolucion,
                    opt => opt.Ignore()
                )
                .ForMember(destino =>
                    destino.TipoEstudio,
                    opt => opt.Ignore()
                );
            #endregion Estudio

            #region Evolucion

            CreateMap<Evolucion, EvolucionDTO>()
                .ForMember(destino =>
                destino.FechaConsulta,
                opt => opt.MapFrom(origen => origen.FechaConsulta.ToString("dd/MM/yyyy"))
                )
                .ForMember(destino =>
                    destino.PacienteNombre,
                    opt => opt.MapFrom(origen => origen.Paciente.Nombre)
                )
                .ForMember(destino =>
                    destino.PlantillaNombre,
                    opt => opt.MapFrom(origen => origen.Plantilla.Nombre)
                )
                .ForMember(destino =>
                    destino.ProblemaTitulo,
                    opt => opt.MapFrom(origen => origen.Problema.Titulo)
                )
                .ForMember(destino =>
                    destino.EstadoProblemaNombre,
                    opt => opt.MapFrom(origen => origen.EstadoProblema.Nombre)
                )
                .ForMember(destino =>
                    destino.MedicoNombre,
                    opt => opt.MapFrom(origen => origen.Medico.Usuario.Nombre)
                )
                .ReverseMap()
                .ForMember(destino =>
                    destino.CampoValors,
                    opt => opt.Ignore()
                )
                .ForMember(destino =>
                    destino.EstadoProblema,
                    opt => opt.Ignore()
                )
                .ForMember(destino =>
                    destino.Estudios,
                    opt => opt.Ignore()
                )
                .ForMember(destino =>
                    destino.Medico,
                    opt => opt.Ignore()
                )
                .ForMember(destino =>
                    destino.Paciente,
                    opt => opt.Ignore()
                )
                .ForMember(destino =>
                    destino.Plantilla,
                    opt => opt.Ignore()
                )
                .ForMember(destino =>
                    destino.Problema,
                    opt => opt.Ignore()
                );

            #endregion Evolucion

            #region FirmaDigital
            CreateMap<FirmaDigital, FirmaDigitalDTO>()
                .ForMember(destino =>
                destino.MedicoNombre,
                opt => opt.MapFrom(origen => origen.Medico.Usuario.Nombre)
                )
                .ForMember(destino =>
                destino.FechaFirma,
                opt => opt.MapFrom(origen => origen.FechaFirma.ToString("dd/MM/yyyy"))
                )
                .ForMember(destino =>
                destino.Valido,
                opt => opt.MapFrom(origen => origen.Valido == true ? 1 : 0))
                .ReverseMap()
                .ForMember(destino =>
                    destino.Medico,
                    opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.Valido,
                opt => opt.MapFrom(origen => origen.Valido == 1 ? true : false)
                );
            #endregion FirmaDigital

            #region Medico
            CreateMap<Medico, MedicoDTO>()
               .ForMember(destino =>
               destino.UsuarioNombre,
               opt => opt.MapFrom(origen => origen.Usuario.Nombre)
               )
               .ForMember(destino =>
               destino.UsuarioApellido,
               opt => opt.MapFrom(origen => origen.Usuario.Apellido)
               )
               .ForMember(destino =>
               destino.UsuarioMail,
               opt => opt.MapFrom(origen => origen.Usuario.Mail)
               )
               .ForMember(destino =>
               destino.UsuarioEstadoNombre,
               opt => opt.MapFrom(origen => origen.Usuario.Estado.Nombre)
               )
               .ForMember(destino =>
               destino.RolNombre,
               opt => opt.MapFrom(origen => origen.Usuario.Rol.Nombre)
               )
               .ReverseMap()
               .ForMember(destino =>
               destino.FechaVencimientoMatricula,
               opt => opt.Ignore()
               )
               .ForMember(destino =>
               destino.Evolucions,
               opt => opt.Ignore()
               )
               .ForMember(destino =>
               destino.FirmaDigitals,
               opt => opt.Ignore()
               )
               .ForMember(destino =>
               destino.Plantillas,
               opt => opt.Ignore()
               )
               // no ignorar cuando es un campo obligatorio
               .ForMember(destino =>
               destino.Usuario,
               opt => opt.Ignore()
               )
               .ForMember(destino =>
               destino.Especialidads,
               opt => opt.Ignore()
               );
            #endregion Medico

            #region ObraSocial
            CreateMap<ObraSocial, ObraSocialDTO>()
                .ForMember(destino =>
                destino.Activo,
                opt => opt.MapFrom(origen => origen.Activo == true ? 1 : 0)
                )
                .ReverseMap()
                .ForMember(destino =>
                destino.PacienteObraSocials,
                opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.PlanSaluds,
                opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.Activo,
                opt => opt.MapFrom(origen => origen.Activo == 1 ? true : false)
                );
            #endregion ObraSocial

            #region Paciente
            CreateMap<Paciente, PacienteDTO>()
                .ForMember(destino =>
                destino.FechaNac,
                opt => opt.MapFrom(origen => origen.FechaNac.ToString("dd/MM/yyyy"))
                )
                .ForMember(destino =>
                destino.DomicilioCiudad,
                opt => opt.MapFrom(origen => origen.Domicilio.Ciudad)
                )
                .ForMember(destino =>
                destino.SexoNombre,
                opt => opt.MapFrom(origen => origen.Sexo.Nombre)
                )
                .ForMember(destino =>
                destino.Activo,
                opt => opt.MapFrom(origen => origen.Activo == true ? 1 : 0)
                )
                .ReverseMap()
                .ForMember(destino =>
                destino.Domicilio,
                opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.Evolucions,
                opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.PacienteObraSocials,
                opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.Sexo,
                opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.Activo,
                opt => opt.MapFrom(origen => origen.Activo == 1 ? true : false)
                );
            #endregion Paciente

            #region PacienteObraSocial
            CreateMap<PacienteObraSocial, PacienteObraSocialDTO>()
                .ForMember(destino =>
                destino.VigenteDesde,
                opt => opt.MapFrom(origen => origen.VigenteDesde.Value.ToString("dd/MM/yyyy"))
                )
                .ForMember(destino =>
                destino.Activo,
                opt => opt.MapFrom(origen => origen.Activo == true ? 1 : 0)
                )
                .ForMember(destino =>
                destino.PacienteNombre,
                opt => opt.MapFrom(origen => origen.Paciente.Nombre)
                )
                .ForMember(destino =>
                destino.ObraSocialNombre,
                opt => opt.MapFrom(origen => origen.ObraSocial.Nombre)
                )
                .ReverseMap()
                .ForMember(destino =>
                destino.Activo,
                opt => opt.MapFrom(origen => origen.Activo == 1 ? true : false)
                )
                .ForMember(destino =>
                destino.ObraSocial,
                opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.Paciente,
                opt => opt.Ignore()
                );
            #endregion PacienteObraSocial

            #region Permiso
            CreateMap<Permiso, PermisoDTO>()
                .ReverseMap()
                .ForMember(destino =>
                destino.RolPermisos,
                opt => opt.Ignore()
                );
            #endregion Permiso

            #region PlanSalud
            CreateMap<PlanSalud, PlanSaludDTO>()
                 .ForMember(destino =>
                 destino.ObraSocialNombre,
                 opt => opt.MapFrom(origen => origen.ObraSocial.Nombre)
                 )
                .ReverseMap()
                .ForMember(destino =>
                destino.ObraSocial,
                opt => opt.Ignore()
                );
            #endregion PlanSalud

            #region Plantilla
            CreateMap<Plantilla, PlantillaDTO>()
                .ForMember(destino =>
                 destino.MedicoNombre,
                 opt => opt.MapFrom(origen => origen.Medico.Usuario.Nombre)
                 )
                .ReverseMap()
                .ForMember(destino =>
                destino.Campos,
                opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.Evolucions,
                opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.Medico,
                opt => opt.Ignore()
                );
            #endregion Plantilla

            #region Problema
            CreateMap<Problema, ProblemaDTO>()
                .ForMember(destino =>
                destino.FechaInicio,
                opt => opt.MapFrom(origen => origen.FechaInicio.Value.ToString("dd/MM/yyyy"))
                )
                .ForMember(destino =>
                destino.FechaFin,
                opt => opt.MapFrom(origen => origen.FechaFin.Value.ToString("dd/MM/yyyy"))
                )
                .ReverseMap()
                .ForMember(destino =>
                destino.Evolucions,
                opt => opt.Ignore()
                );
            #endregion Problema

            #region Rol
            CreateMap<Rol, RolDTO>()
                .ReverseMap()
                .ForMember(destino =>
                destino.RolPermisos,
                opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.Usuarios,
                opt => opt.Ignore()
                );
            #endregion Rol

            #region RolPermiso
            CreateMap<RolPermiso, RolPermisoDTO>()
                .ForMember(destino =>
                destino.RolNombre,
                opt => opt.MapFrom(origen => origen.Rol.Nombre)
                )
                .ForMember(destino =>
                destino.PermisoNombre,
                opt => opt.MapFrom(origen => origen.Permiso.Nombre)
                )
                .ReverseMap()
                .ForMember(destino =>
                destino.Permiso,
                opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.Rol,
                opt => opt.Ignore()
                );

            #endregion RolPermiso

            #region Sexo
            CreateMap<Sexo, SexoDTO>()
                .ReverseMap()
                .ForMember(destino =>
                destino.Pacientes,
                opt => opt.Ignore()
                );
            #endregion Sexo

            #region TipoCampo
            CreateMap<TipoCampo, TipoCampoDTO>()
                .ReverseMap()
                .ForMember(destino =>
                destino.Campos,
                opt => opt.Ignore()
                );
            #endregion TipoCampo

            #region TipoEstudio
            CreateMap<TipoEstudio, TipoEstudioDTO>()
                .ForMember(destino =>
                destino.Activo,
                opt => opt.MapFrom(origen => origen.Activo == true ? 1 : 0)
                )
                .ReverseMap()
                .ForMember(destino =>
                destino.Estudios,
                opt => opt.Ignore()
                )
                .ForMember(destino =>
                destino.Activo,
                opt => opt.MapFrom(origen => origen.Activo == 1 ? true : false)
                );
            #endregion TipoEstudio

            #region Usuario
            CreateMap<Usuario, UsuarioDTO>()
                .ForMember(destino =>
                destino.RolNombre,
                opt => opt.MapFrom(origen => origen.Rol.Nombre)
                )
                .ForMember(destino =>
                destino.EstadoNombre,
                opt => opt.MapFrom(origen => origen.Estado.Nombre)
                )
                .ForMember(destino =>
                destino.Matricula,
                opt => opt.MapFrom(origen => origen.Medico.Matricula)
                )
                .ForMember(destino =>
                destino.FechaVencimientoMatricula,
                opt => opt.MapFrom(origen => origen.Medico.FechaVencimientoMatricula.ToString("yyyy-MM-dd"))
                );


            CreateMap<Usuario, SesionDTO>()
                .ForMember(destino =>
                destino.RolNombre,
                opt => opt.MapFrom(origen => origen.Rol.Nombre)
                );

            CreateMap<UsuarioDTO, Usuario>()
               .ForMember(destino =>
               destino.Rol,
               opt => opt.Ignore()
               )
               .ForMember(destino =>
               destino.Estado,
               opt => opt.Ignore()
               )
               .ForMember(d =>
               d.FechaCreacion,
               o => o.Ignore()
               )
               .ForMember(d =>
               d.UltimoAcceso,
               o => o.Ignore()
               )
                .ForMember(d =>
               d.Medico,
               o => o.Ignore()
               );

            CreateMap<UsuarioCrearDTO, Usuario>()
               .ReverseMap();

            CreateMap<UsuarioEditarDTO, Usuario>()
               .ReverseMap()
               .ForMember(destino =>
                destino.FechaVencimientoMatricula,
                opt => opt.MapFrom(origen => origen.Medico.FechaVencimientoMatricula.ToString("yyyy-MM-dd"))
                );
            #endregion Usuario
        }
    }
}