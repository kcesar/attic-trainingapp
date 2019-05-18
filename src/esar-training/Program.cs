using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;

namespace esar_training
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("ESAR training site " + System.Diagnostics.Process.GetCurrentProcess().Id);
            var host = new WebHostBuilder()
                .UseKestrel()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseStartup<Startup>()
                .Build();

            host.Run();
        }
    }
}
