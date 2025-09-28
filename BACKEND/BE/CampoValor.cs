using System;
using System.Collections.Generic;

namespace BE;

public partial class CampoValor
{
    public int Id { get; set; }

    public int CampoId { get; set; }

    public int EvolucionId { get; set; }

    public string Valor { get; set; } = null!;

    public virtual Campo Campo { get; set; } = null!;

    public virtual Evolucion Evolucion { get; set; } = null!;
}
