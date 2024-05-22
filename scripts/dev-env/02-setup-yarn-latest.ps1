$minimumYarnVersion = [System.Version]"3.3.1"
$currentYarnVersion = $(yarn --version)
if ($currentYarnVersion -lt $minimumYarnVersion) {
    corepack enable
    corepack prepare yarn@stable --activate
    yarn
}