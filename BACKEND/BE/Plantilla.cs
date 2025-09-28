using System;
using System.Collections.Generic;

namespace BE;

public partial class Plantilla
{
    public int Id { get; set; }

    public bool? Activo { get; set; }

    public string? Descripcion { get; set; }

    public string? Nombre { get; set; }

    public int MedicoId { get; set; }

    public virtual ICollection<Campo> Campos { get; set; } = new List<Campo>();

    public virtual ICollection<Evolucion> Evolucions { get; set; } = new List<Evolucion>();

    public virtual Medico Medico { get; set; } = null!;
}
