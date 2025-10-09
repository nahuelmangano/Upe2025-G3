﻿using System;
using System.Collections.Generic;

namespace BE;

public partial class Especialidad
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public bool Activo { get; set; }
    public virtual ICollection<Medico> Medicos { get; set; } = new List<Medico>();
}
