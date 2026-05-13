' D-CLOCK Panel de Licencias — Launcher sin ventana de consola
Dim WshShell
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run Chr(34) & WScript.ScriptFullName & Chr(34), 0, False

Dim scriptDir
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
WshShell.Run Chr(34) & scriptDir & "iniciar-panel.bat" & Chr(34), 0, False

Set WshShell = Nothing
