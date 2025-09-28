using System;
using System.Collections.Generic;

namespace BE;

public partial class EstadoUsuario
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
