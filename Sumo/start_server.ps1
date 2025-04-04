# Ensure PowerShell is allowed to run scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Activate the virtual environment
$venvPath = ".\env"
if (!(Test-Path $venvPath)) {
    Write-Error "Virtual environment not found at $venvPath"
    exit 1
}

. $venvPath\Scripts\Activate.ps1

# Run the Flask API
$appPath = ".\main.py"
if (!(Test-Path $appPath)) {
    Write-Error "Flask application file not found at $appPath"
    exit 1
}

python $appPath