using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;

namespace BLL
{
    public class Recursos
    {
        public static bool EsMailValido(string email)
        {
            var atributo = new EmailAddressAttribute();
            return atributo.IsValid(email);
        }
        public static string ConvertirSha256(string texto)
        {
            StringBuilder Sb = new StringBuilder();

            using (SHA256 hash = SHA256Managed.Create())
            {
                Encoding enc = Encoding.UTF8;
                byte[] result = hash.ComputeHash(enc.GetBytes(texto));

                foreach (byte b in result)
                    Sb.Append(b.ToString("x2"));
            }

            return Sb.ToString(); // devuelve un texto encriptado
        }
    }
}