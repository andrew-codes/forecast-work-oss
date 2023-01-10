$workbenchDir = "./scripts"

$myWindowsID = [System.Security.Principal.WindowsIdentity]::GetCurrent()
$myWindowsPrincipal = new-object System.Security.Principal.WindowsPrincipal($myWindowsID)
$adminRole = [System.Security.Principal.WindowsBuiltInRole]::Administrator
if (!$myWindowsPrincipal.IsInRole($adminRole)) {
    Start-Process -FilePath PowerShell.exe -Verb Runas @"
-noexit -c `Set-Location -LiteralPath "$PWD"; $workbenchDir/dev-env.ps1`
"@
    Exit
}

Get-ChildItem -Path "$workbenchDir/dev-env" | ForEach-Object {
    Write-Host "Processing step: $_"
    try {
        powershell -Command "$workbenchDir/dev-env/$_"
    }
    catch {
        exit 1
    }
}