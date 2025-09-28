using System;
using System.Collections.Generic;

namespace BE;

public partial class Usuario
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string Apellido { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public string Mail { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public DateTime? UltimoAcceso { get; set; }

    public int EstadoId { get; set; }

    public int RolId { get; set; }

    public virtual EstadoUsuario Estado { get; set; } = null!;

    public virtual Medico? Medico { get; set; }

    public virtual Rol Rol { get; set; } = null!;
}
