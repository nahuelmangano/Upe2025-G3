using System;
using System.Collections.Generic;

namespace BE;

public partial class TipoEstudio
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;
    
    public bool Activo { get; set; } 

    public virtual ICollection<Estudio> Estudios { get; set; } = new List<Estudio>();
}
