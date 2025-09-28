using System;
using System.Collections.Generic;

namespace BE;

public partial class Problema
{
    public int Id { get; set; }

    public string? Titulo { get; set; }

    public string? Descripcion { get; set; }

    public DateTime? FechaInicio { get; set; }

    public DateTime? FechaFin { get; set; }

    public virtual ICollection<Evolucion> Evolucions { get; set; } = new List<Evolucion>();
}
