using System;
using System.Collections.Generic;

namespace BE;

public partial class ObraSocial
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<PacienteObraSocial> PacienteObraSocials { get; set; } = new List<PacienteObraSocial>();

    public virtual ICollection<PlanSalud> PlanSaluds { get; set; } = new List<PlanSalud>();
}
