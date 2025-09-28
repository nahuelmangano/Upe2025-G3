using System;
using System.Collections.Generic;

namespace BE;

public partial class PlanSalud
{
    public long Id { get; set; }

    public long Codigo { get; set; }

    public string Nombre { get; set; } = null!;

    public int ObraSocialId { get; set; }

    public virtual ObraSocial ObraSocial { get; set; } = null!;
}
