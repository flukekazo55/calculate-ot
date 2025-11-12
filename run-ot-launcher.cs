using System;
using System.Diagnostics;
using System.IO;

namespace CalculateOt
{
    internal static class RunOtLauncher
    {
        private const string ServerUrl = "http://localhost:3000";

        private static Process _currentServerProcess;
        private static bool _shutdownHooksAttached;

        private static int Main()
        {
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            Directory.SetCurrentDirectory(baseDir);

            if (!CommandExists("node.exe"))
            {
                Console.WriteLine("Node.js is required. Please install it from https://nodejs.org/.");
                return 1;
            }

            if (!Directory.Exists(Path.Combine(baseDir, "node_modules")))
            {
                Console.WriteLine("Installing dependencies (npm install)...");
                var npmExit = RunProcessAndWait("npm.cmd", "install");
                if (npmExit != 0)
                {
                    Console.WriteLine("npm install failed (exit code " + npmExit + ").");
                    return npmExit;
                }
            }

            Console.WriteLine("Opening " + ServerUrl + "...");
            TryOpenBrowser(ServerUrl);

            Console.WriteLine("Starting server (press Ctrl+C to stop)...");
            return RunServer("node.exe", "server.js");
        }

        private static bool CommandExists(string command)
        {
            var psi = new ProcessStartInfo("cmd.exe", "/c where " + command)
            {
                UseShellExecute = false,
                CreateNoWindow = true
            };

            Process proc = null;
            try
            {
                proc = Process.Start(psi);
                if (proc == null)
                {
                    return false;
                }

                proc.WaitForExit();
                return proc.ExitCode == 0;
            }
            catch
            {
                return false;
            }
            finally
            {
                if (proc != null)
                {
                    proc.Dispose();
                }
            }
        }

        private static int RunProcessAndWait(string fileName, string arguments)
        {
            var psi = new ProcessStartInfo(fileName, arguments ?? string.Empty)
            {
                WorkingDirectory = Directory.GetCurrentDirectory(),
                UseShellExecute = false
            };

            Process proc = null;
            try
            {
                proc = Process.Start(psi);
                if (proc == null)
                {
                    return 1;
                }

                proc.WaitForExit();
                return proc.ExitCode;
            }
            finally
            {
                if (proc != null)
                {
                    proc.Dispose();
                }
            }
        }

        private static int RunServer(string fileName, string arguments)
        {
            var psi = new ProcessStartInfo(fileName, arguments ?? string.Empty)
            {
                WorkingDirectory = Directory.GetCurrentDirectory(),
                UseShellExecute = false
            };

            AttachShutdownHooks();

            Process proc = null;
            try
            {
                proc = Process.Start(psi);
                if (proc == null)
                {
                    return 1;
                }

                _currentServerProcess = proc;
                proc.WaitForExit();
                return proc.ExitCode;
            }
            finally
            {
                _currentServerProcess = null;
                if (proc != null)
                {
                    proc.Dispose();
                }
            }
        }

        private static void AttachShutdownHooks()
        {
            if (_shutdownHooksAttached)
            {
                return;
            }

            _shutdownHooksAttached = true;
            AppDomain.CurrentDomain.ProcessExit += (_, __) => KillServerProcess();
            Console.CancelKeyPress += (_, e) =>
            {
                KillServerProcess();
                if (e != null)
                {
                    e.Cancel = false;
                }
            };
        }

        private static void KillServerProcess()
        {
            var proc = _currentServerProcess;
            if (proc == null)
            {
                return;
            }

            try
            {
                if (!proc.HasExited)
                {
                    Console.WriteLine("Stopping existing Node.js server...");
                    proc.Kill();
                    proc.WaitForExit(3000);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Unable to stop Node.js server automatically: " + ex.Message);
            }
        }

        private static void TryOpenBrowser(string url)
        {
            try
            {
                var psi = new ProcessStartInfo("cmd.exe", "/c start \"\" \"" + url + "\"")
                {
                    CreateNoWindow = true,
                    UseShellExecute = false
                };
                Process.Start(psi);
            }
            catch
            {
                Console.WriteLine("Unable to open the browser automatically.");
            }
        }
    }
}
