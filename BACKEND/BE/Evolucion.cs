using System;
using System.Collections.Generic;

namespace BE;

public partial class Evolucion
{
    public int Id { get; set; }

    public string? Descripcion { get; set; }

    public DateTime FechaConsulta { get; set; }

    public string DiagnosticoInicial { get; set; } = null!;

    public string? DiagnosticoDefinitivo { get; set; }

    public int PacienteId { get; set; }

    public int? PlantillaId { get; set; }

    public int ProblemaId { get; set; }

    public int EstadoProblemaId { get; set; }

    public int MedicoId { get; set; }

    public virtual ICollection<CampoValor> CampoValors { get; set; } = new List<CampoValor>();

    public virtual EstadoProblema EstadoProblema { get; set; } = null!;

    public virtual ICollection<Estudio> Estudios { get; set; } = new List<Estudio>();

    public virtual Medico Medico { get; set; } = null!;

    public virtual Paciente Paciente { get; set; } = null!;

    public virtual Plantilla? Plantilla { get; set; }

    public virtual Problema Problema { get; set; } = null!;
}
