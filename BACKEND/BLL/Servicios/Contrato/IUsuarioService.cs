using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Servicios.Contrato
{
    public interface IUsuarioService
    {
        Task<List<UsuarioDTO>> Lista();
        Task<SesionDTO> ValidarCredenciales(string mail, string passwordHash);
        Task<SesionDTO> CambiarPassword(string mail, string passwordAntigua, string nuevaPassword, string repetirNuevaPassword);
        Task<SesionDTO> EnviarMailParaCambiarPassword(string mail);
        Task<UsuarioDTO> Crear(UsuarioCrearDTO modelo);
        Task<bool> Editar(UsuarioEditarDTO modelo);
        Task<bool> Desactivar(int id);
    }
}
