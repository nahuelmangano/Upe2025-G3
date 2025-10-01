using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using BE;

namespace DAL.DBContext;

public partial class DbUpeclinicaContext : DbContext
{
    public DbUpeclinicaContext()
    {
    }

    public DbUpeclinicaContext(DbContextOptions<DbUpeclinicaContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ArchivoAdjunto> ArchivoAdjuntos { get; set; }

    public virtual DbSet<Campo> Campos { get; set; }

    public virtual DbSet<CampoValor> CampoValors { get; set; }

    public virtual DbSet<Domicilio> Domicilios { get; set; }

    public virtual DbSet<Especialidad> Especialidads { get; set; }

    public virtual DbSet<EstadoProblema> EstadoProblemas { get; set; }

    public virtual DbSet<EstadoUsuario> EstadoUsuarios { get; set; }

    public virtual DbSet<Estudio> Estudios { get; set; }

    public virtual DbSet<Evolucion> Evolucions { get; set; }

    public virtual DbSet<FirmaDigital> FirmaDigitals { get; set; }

    public virtual DbSet<Medico> Medicos { get; set; }

    public virtual DbSet<ObraSocial> ObraSocials { get; set; }

    public virtual DbSet<Paciente> Pacientes { get; set; }

    public virtual DbSet<PacienteObraSocial> PacienteObraSocials { get; set; }

    public virtual DbSet<Permiso> Permisos { get; set; }

    public virtual DbSet<PlanSalud> PlanSaluds { get; set; }

    public virtual DbSet<Plantilla> Plantillas { get; set; }

    public virtual DbSet<Problema> Problemas { get; set; }

    public virtual DbSet<Rol> Rols { get; set; }

    public virtual DbSet<RolPermiso> RolPermisos { get; set; }

    public virtual DbSet<Sexo> Sexos { get; set; }

    public virtual DbSet<TipoCampo> TipoCampos { get; set; }

    public virtual DbSet<TipoEstudio> TipoEstudios { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ArchivoAdjunto>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ArchivoA__3213E83F36AF7736");

            entity.ToTable("ArchivoAdjunto");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.FechaSubida).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.NombreArchivo).HasMaxLength(500);
            entity.Property(e => e.Url).HasMaxLength(2000);

            entity.HasOne(d => d.Estudio).WithMany(p => p.ArchivoAdjuntos)
                .HasForeignKey(d => d.EstudioId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ArchivoAdjunto_estudio");
        });

        modelBuilder.Entity<Campo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Campo__3213E83FB1F2AFDF");

            entity.ToTable("Campo");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Etiqueta).HasMaxLength(255);
            entity.Property(e => e.Obligatorio).HasDefaultValue(false);

            entity.HasOne(d => d.Plantilla).WithMany(p => p.Campos)
                .HasForeignKey(d => d.PlantillaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Campo_Plantilla");

            entity.HasOne(d => d.TipoCampo).WithMany(p => p.Campos)
                .HasForeignKey(d => d.TipoCampoId)
                .HasConstraintName("FK_Campo_TipoCampo");
        });

        modelBuilder.Entity<CampoValor>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CampoVal__3213E83FF266B213");

            entity.ToTable("CampoValor");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Valor).HasMaxLength(200);

            entity.HasOne(d => d.Campo).WithMany(p => p.CampoValors)
                .HasForeignKey(d => d.CampoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Campo_id");

            entity.HasOne(d => d.Evolucion).WithMany(p => p.CampoValors)
                .HasForeignKey(d => d.EvolucionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Evolucion_id");
        });

        modelBuilder.Entity<Domicilio>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Domicili__3213E83FD210B9F3");

            entity.ToTable("Domicilio");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Altura).HasMaxLength(50);
            entity.Property(e => e.Calle).HasMaxLength(255);
            entity.Property(e => e.Ciudad).HasMaxLength(200);
            entity.Property(e => e.CodigoPostal).HasMaxLength(50);
            entity.Property(e => e.Departamento).HasMaxLength(50);
            entity.Property(e => e.Pais).HasMaxLength(100);
            entity.Property(e => e.Piso).HasMaxLength(50);
            entity.Property(e => e.Provincia).HasMaxLength(100);
        });

        modelBuilder.Entity<Especialidad>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Especial__3213E83F2CC43516");

            entity.ToTable("Especialidad");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasMaxLength(200);
        });

        modelBuilder.Entity<EstadoProblema>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__EstadoPr__3213E83FDDF35D19");

            entity.ToTable("EstadoProblema");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasMaxLength(150);
        });

        modelBuilder.Entity<EstadoUsuario>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__EstadoUs__3213E83FC7A25CE0");

            entity.ToTable("EstadoUsuario");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<Estudio>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Estudio__3213E83FC526B414");

            entity.ToTable("Estudio");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Fecha).HasColumnType("datetime");
            entity.Property(e => e.Observaciones).HasMaxLength(100);
            entity.Property(e => e.RealizadoPor).HasMaxLength(100);

            entity.HasOne(d => d.Evolucion).WithMany(p => p.Estudios)
                .HasForeignKey(d => d.EvolucionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Estudio_evolucion");

            entity.HasOne(d => d.TipoEstudio).WithMany(p => p.Estudios)
                .HasForeignKey(d => d.TipoEstudioId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Estudio_tipo");
        });

        modelBuilder.Entity<Evolucion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Evolucio__3213E83FC5A402BA");

            entity.ToTable("Evolucion");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DiagnosticoDefinitivo).HasMaxLength(200);
            entity.Property(e => e.DiagnosticoInicial).HasMaxLength(200);
            entity.Property(e => e.FechaConsulta).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.EstadoProblema).WithMany(p => p.Evolucions)
                .HasForeignKey(d => d.EstadoProblemaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Evolucion_estado_problema");

            entity.HasOne(d => d.Medico).WithMany(p => p.Evolucions)
                .HasForeignKey(d => d.MedicoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Evolucion_medico");

            entity.HasOne(d => d.Paciente).WithMany(p => p.Evolucions)
                .HasForeignKey(d => d.PacienteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Evolucion_paciente");

            entity.HasOne(d => d.Plantilla).WithMany(p => p.Evolucions)
                .HasForeignKey(d => d.PlantillaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Evolucion_plantilla");

            entity.HasOne(d => d.Problema).WithMany(p => p.Evolucions)
                .HasForeignKey(d => d.ProblemaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Evolucion_problema");
        });

        modelBuilder.Entity<FirmaDigital>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__FirmaDig__3213E83FE496CCCB");

            entity.ToTable("FirmaDigital");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Algoritmo).HasMaxLength(100);
            entity.Property(e => e.FechaFirma).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.HashDocumento).HasMaxLength(512);
            entity.Property(e => e.MedicoId).HasColumnName("medicoId");

            entity.HasOne(d => d.Medico).WithMany(p => p.FirmaDigitals)
                .HasForeignKey(d => d.MedicoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_medicoId");
        });

        modelBuilder.Entity<Medico>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Medico__3213E83F86D29EE4");

            entity.ToTable("Medico");

            entity.HasIndex(e => e.UsuarioId, "UQ__Medico__2B3DE7B949A31A02").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Matricula).HasMaxLength(100);

            entity.HasOne(d => d.Usuario).WithOne(p => p.Medico)
                .HasForeignKey<Medico>(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Medico_Usuario");

            entity.HasMany(d => d.Especialidads).WithMany(p => p.Medicos)
                .UsingEntity<Dictionary<string, object>>(
                    "MedicoEspecialidad",
                    r => r.HasOne<Especialidad>().WithMany()
                        .HasForeignKey("EspecialidadId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_ME_Especialidad"),
                    l => l.HasOne<Medico>().WithMany()
                        .HasForeignKey("MedicoId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_ME_Medico"),
                    j =>
                    {
                        j.HasKey("MedicoId", "EspecialidadId");
                        j.ToTable("MedicoEspecialidad");
                    });
        });

        modelBuilder.Entity<ObraSocial>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ObraSoci__3213E83F6DBBFE03");

            entity.ToTable("ObraSocial");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasMaxLength(255);
        });

        modelBuilder.Entity<Paciente>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Paciente__3213E83F3B25B975");

            entity.ToTable("Paciente");

            entity.HasIndex(e => e.Dni, "UQ_Paciente_Dni").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Apellido).HasMaxLength(150);
            entity.Property(e => e.Dni).HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.GrupoSanguineo).HasMaxLength(50);
            entity.Property(e => e.Nacionalidad).HasMaxLength(100);
            entity.Property(e => e.Nombre).HasMaxLength(150);
            entity.Property(e => e.Ocupacion).HasMaxLength(200);
            entity.Property(e => e.Telefono1).HasMaxLength(50);
            entity.Property(e => e.Telefono2).HasMaxLength(50);

            entity.HasOne(d => d.Domicilio).WithMany(p => p.Pacientes)
                .HasForeignKey(d => d.DomicilioId)
                .HasConstraintName("FK_Paciente_Domicilio");

            entity.HasOne(d => d.Sexo).WithMany(p => p.Pacientes)
                .HasForeignKey(d => d.SexoId)
                .HasConstraintName("FK_Paciente_Sexo");
        });

        modelBuilder.Entity<PacienteObraSocial>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Paciente__3213E83F64EABDDB");

            entity.ToTable("PacienteObraSocial");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.NumeroAfiliado).HasMaxLength(100);

            entity.HasOne(d => d.ObraSocial).WithMany(p => p.PacienteObraSocials)
                .HasForeignKey(d => d.ObraSocialId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_POS_ObraSocial");

            entity.HasOne(d => d.Paciente).WithMany(p => p.PacienteObraSocials)
                .HasForeignKey(d => d.PacienteId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_POS_Paciente");
        });

        modelBuilder.Entity<Permiso>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Permiso__3213E83F3D91444E");

            entity.ToTable("Permiso");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasMaxLength(200);
            entity.Property(e => e.Descripcion).HasMaxLength(200);
        });

        modelBuilder.Entity<PlanSalud>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__PlanSalu__3213E83F5D81DCD0");

            entity.ToTable("PlanSalud");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasMaxLength(200);

            entity.HasOne(d => d.ObraSocial).WithMany(p => p.PlanSaluds)
                .HasForeignKey(d => d.ObraSocialId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PS_ObraSocial");
        });

        modelBuilder.Entity<Plantilla>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Plantill__3213E83F5ADE7A09");

            entity.ToTable("Plantilla");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Descripcion).HasMaxLength(500);
            entity.Property(e => e.Nombre).HasMaxLength(255);

            entity.HasOne(d => d.Medico).WithMany(p => p.Plantillas)
                .HasForeignKey(d => d.MedicoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Plantilla");
        });

        modelBuilder.Entity<Problema>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Problema__3213E83F706A7916");

            entity.ToTable("Problema");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Titulo).HasMaxLength(255);
        });

        modelBuilder.Entity<Rol>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Rol__3213E83F12890DCF");

            entity.ToTable("Rol");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasMaxLength(200);
        });

        modelBuilder.Entity<RolPermiso>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RolPermi__A80C5474817E0151");

            entity.ToTable("RolPermiso");

            entity.Property(e => e.Id).HasColumnName("id");

            entity.HasOne(d => d.Permiso).WithMany(p => p.RolPermisos)
                .HasForeignKey(d => d.PermisoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RP_Permiso");

            entity.HasOne(d => d.Rol).WithMany(p => p.RolPermisos)
                .HasForeignKey(d => d.RolId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RP_Rol");
        });

        modelBuilder.Entity<Sexo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Sexo__3213E83FA89332E8");

            entity.ToTable("Sexo");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<TipoCampo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__TipoCamp__3213E83F67152D6E");

            entity.ToTable("TipoCampo");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<TipoEstudio>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__TipoEstu__3213E83F96DA218C");

            entity.ToTable("TipoEstudio");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Usuario__3213E83FC5C6EA76");

            entity.ToTable("Usuario");

            entity.HasIndex(e => e.Mail, "UQ_Usuario_Mail").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Apellido).HasMaxLength(150);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Mail).HasMaxLength(255);
            entity.Property(e => e.Nombre).HasMaxLength(150);
            entity.Property(e => e.PasswordHash).HasMaxLength(512);

            entity.HasOne(d => d.Estado).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.EstadoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Usuario_EstadoUsuario");

            entity.HasOne(d => d.Rol).WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.RolId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Usuario_Rol");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
