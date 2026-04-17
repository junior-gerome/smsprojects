@echo off
setlocal EnableExtensions

set "DIRNAME=%~dp0"
if "%DIRNAME%"=="" set "DIRNAME=."
set "APP_HOME=%DIRNAME%"
if "%APP_HOME:~-1%"=="\" set "APP_HOME=%APP_HOME:~0,-1%"

set "GRADLE_VERSION=8.10.2"
set "DIST_NAME=gradle-%GRADLE_VERSION%-bin"
set "DIST_URL=https://services.gradle.org/distributions/%DIST_NAME%.zip"
set "WRAPPER_HOME=%APP_HOME%\.gradle-wrapper"
set "DIST_HOME=%WRAPPER_HOME%\dist"
set "ZIP_FILE=%WRAPPER_HOME%\%DIST_NAME%.zip"
set "GRADLE_HOME=%DIST_HOME%\gradle-%GRADLE_VERSION%"
set "GRADLE_CMD=%GRADLE_HOME%\bin\gradle.bat"

if not exist "%GRADLE_CMD%" (
  echo Preparing Gradle %GRADLE_VERSION%...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference = 'Stop'; $wrapperHome = '%WRAPPER_HOME%'; $distHome = '%DIST_HOME%'; $cacheZip = '%ZIP_FILE%'; $gradleHome = '%GRADLE_HOME%'; New-Item -ItemType Directory -Force -Path $wrapperHome, $distHome | Out-Null; $sourceZip = $null; if (Test-Path $cacheZip) { try { $stream = [System.IO.File]::Open($cacheZip, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite); $stream.Close(); $sourceZip = $cacheZip; } catch { $sourceZip = $null; } }; if (-not $sourceZip) { $tempZip = Join-Path $wrapperHome ('gradle-bootstrap-' + [guid]::NewGuid().ToString() + '.zip'); Invoke-WebRequest -Uri '%DIST_URL%' -OutFile $tempZip; $sourceZip = $tempZip; try { Copy-Item -Force $tempZip $cacheZip } catch { } }; if (Test-Path $gradleHome) { Remove-Item -Recurse -Force $gradleHome; }; Expand-Archive -Path $sourceZip -DestinationPath $distHome -Force; if (($sourceZip -ne $cacheZip) -and (Test-Path $sourceZip)) { Remove-Item -Force $sourceZip -ErrorAction SilentlyContinue; }"
  if errorlevel 1 exit /b 1
)

if exist "%APP_HOME%\.env" call :load_env_file "%APP_HOME%\.env"
if exist "%APP_HOME%\.env.local" call :load_env_file "%APP_HOME%\.env.local"

if "%1"=="bootRun" if "%SPRING_PROFILES_ACTIVE%"=="" set "SPRING_PROFILES_ACTIVE=local"

set "DEFAULT_JVM_OPTS=-Xms128m -Xmx512m"
call "%GRADLE_CMD%" %*
exit /b %errorlevel%

:load_env_file
for /f "usebackq tokens=1,* delims==" %%A in ("%~1") do (
  if not "%%A"=="" if not "%%A:~0,1%%"=="#" set "%%A=%%B"
)
exit /b 0
