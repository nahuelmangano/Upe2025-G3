using System;
using System.Collections.Generic;

namespace BE;

public partial class TipoCampo
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Campo> Campos { get; set; } = new List<Campo>();
}
