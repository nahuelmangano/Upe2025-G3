using System;
using System.Collections.Generic;

namespace BE;

public partial class Medico
{
    public int Id { get; set; }

    public string Matricula { get; set; } = null!;

    public DateOnly FechaVencimientoMatricula { get; set; }

    public int UsuarioId { get; set; }

    public virtual ICollection<Evolucion> Evolucions { get; set; } = new List<Evolucion>();

    public virtual ICollection<FirmaDigital> FirmaDigitals { get; set; } = new List<FirmaDigital>();

    public virtual ICollection<Plantilla> Plantillas { get; set; } = new List<Plantilla>();

    public virtual Usuario Usuario { get; set; } = null!;

    public virtual ICollection<Especialidad> Especialidads { get; set; } = new List<Especialidad>();
}