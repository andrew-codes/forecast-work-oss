$packageJson = $(Get-Content package.json) | ConvertFrom-Json
$versionDesired = $packageJson.engines.node
$response = nvm use $versionDesired;
if ($response -match 'is not installed') {
    if ($response -match '64-bit') {
        nvm install $versionDesired x64
    }
    else {
        nvm install $versionDesired x86
    }
    nvm use $versionDesired;
}