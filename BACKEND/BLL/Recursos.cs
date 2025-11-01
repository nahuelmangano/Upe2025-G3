using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Net.Mail;
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
        public static string GenerarPassword()
        {
            string password = Guid.NewGuid().ToString("N").Substring(0, 6);

            return password;
        }

        public static bool EnviarCorreo(string correo, string asunto, string mensaje)
        {
            bool resultado = false;

            try
            {
                MailMessage mail = new MailMessage();
                mail.To.Add(correo);
                mail.From = new MailAddress("testpuntonet42@gmail.com");
                mail.Subject = asunto;
                mail.Body = mensaje;
                mail.IsBodyHtml = true;

                var smtp = new SmtpClient()
                {
                    Credentials = new NetworkCredential("testpuntonet42@gmail.com", "nnkzgnbkhmxacedu"),
                    Host = "smtp.gmail.com",
                    Port = 587,
                    EnableSsl = true
                };

                smtp.Send(mail);
                resultado = true;
            }
            catch (Exception ex)
            {
                resultado = false;
                Console.WriteLine(ex);
            }

            return resultado;
        }
    }
}