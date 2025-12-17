$remoteUrl = "https://github.com/handong2u-gif/BIODOT-CONTROL.git"

# Check for git
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Warning "Git command 'git' not found in PATH."
    Write-Host "Attempting to find Git in common locations..."
    
    $commonPaths = @(
        "C:\Program Files\Git\cmd\git.exe",
        "C:\Program Files\Git\bin\git.exe",
        "C:\Users\$env:USERNAME\AppData\Local\Programs\Git\cmd\git.exe"
    )
    
    $gitPath = $null
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            $gitPath = $path
            break
        }
    }
    
    if ($gitPath) {
        Write-Host "Found Git at: $gitPath"
        function git { & $gitPath @args }
    }
    else {
        Write-Error "Git is really not found. Please install Git from https://git-scm.com/ and restart your terminal."
        exit 1
    }
}

# Initialize Git repository if it doesn't exist
if (!(Test-Path .git)) {
    Write-Host "Initializing Git repository..."
    git init
}

# Add all files to staging
Write-Host "Adding files..."
git add .

# Commit changes
Write-Host "Committing changes..."
# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    git commit -m "Updates from Antigravity: Project Upload"
}
else {
    Write-Host "No changes to commit."
}

# Configure remote
$currentRemote = git remote get-url origin 2>$null
if ($currentRemote -ne $remoteUrl) {
    if ($currentRemote) {
        Write-Host "Updating remote 'origin' from $currentRemote to $remoteUrl"
        git remote set-url origin $remoteUrl
    }
    else {
        Write-Host "Adding remote 'origin': $remoteUrl"
        git remote add origin $remoteUrl
    }
}

# Push to remote
Write-Host "Pushing to remote ($remoteUrl)..."
git branch -M main
git push -u origin main
