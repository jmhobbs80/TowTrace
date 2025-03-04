# Navigate to the TowTrace root directory (adjust if needed)
Set-Location -Path "C:\Users\jhobb\TowTrace"

# Ensure .gitignore ignores node_modules, .next, and build artifacts
$gitignorePath = ".gitignore"
$ignorePatterns = @(
    "node_modules/",
    ".next/",
    "mobile\*\build\",
    "mobile\*\ios\build\",
    "mobile\*\android\build\",
    "frontend\towtrace-dashboard\.next\",
    "backend\towtrace-api\dist\"
)

foreach ($pattern in $ignorePatterns) {
    if (-not (Select-String -Path $gitignorePath -Pattern $pattern -Quiet)) {
        Add-Content -Path $gitignorePath -Value $pattern
        Write-Host "Added $pattern to .gitignore"
    }
}

# Check Git status and exit if no changes
if (-not (git status --porcelain)) {
    Write-Host "No changes to process."
    exit 0
}

# Find the 5 most recently modified files (excluding ignored directories)
# Adjust '5' to the number of files you want to keep (e.g., 1 for only the latest)
$recentFiles = Get-ChildItem -Recurse -Exclude "node_modules", ".next", "build", ".git", ".gitignore", ".env.local" | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 5 -ExpandProperty FullName

Write-Host "Keeping changes for the following recently modified files:"
foreach ($file in $recentFiles) {
    Write-Host $file
}

# Stage only the most recently modified files
foreach ($file in $recentFiles) {
    if (Test-Path $file) {
        git add $file
        Write-Host "Staged: $file"
    }
}

# Unstage all other changes (discard changes for other files)
git reset .  # Unstage all changes
foreach ($file in $recentFiles) {
    if (Test-Path $file) {
        git add $file  # Re-stage only recent files
    }
}

# Verify staged changes
Write-Host "Staged changes:"
git status

# Optional: Commit the staged changes
$commit = Read-Host "Do you want to commit these changes? (y/n)"
if ($commit -eq 'y' -or $commit -eq 'Y') {
    git commit -m "Commit latest changes to recently modified files for TowTrace (ELD, GPS, subscription updates)"
    Write-Host "Changes committed. Now pushing to GitHub..."
    git push origin main  # Adjust to 'master' if needed
}

# Optional: Push to GitHub (uncomment if you want to automate pushing)
# git push origin main  # Adjust to 'master' if needed