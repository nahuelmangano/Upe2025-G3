using System;
using System.Collections.Generic;

namespace BE;

public partial class EstadoProblema
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Evolucion> Evolucions { get; set; } = new List<Evolucion>();
}
