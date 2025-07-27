# Git Repository Setup for TransitTrack (Generic Version)
# This script sets up proper Git workflow with dev, preview, and clean main branches.
# It operates in the current directory, assuming it's a Git repository.

# IMPORTANT: Before running, ensure your Git remote 'origin' is correctly configured
# (e.g., `git remote remove origin`, `git remote add origin <your_repo_url>`)
# and your Git authentication (SSH key or HTTPS PAT) is working.

# Ensure script output encoding is UTF-8 for consistency and proper display.
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Setting up TransitTrack Git repository structure..."

# --- Initial Environment Checks ---
Write-Host "Verifying current directory is a Git repository..."
try {
    $isGitRepo = (git rev-parse --is-inside-work-tree 2>$null).Trim()
    if ($isGitRepo -ne "true") {
        Write-Error "The current directory '$PWD' is not a Git repository. Please navigate to the root of your Git repository before running this script."
        exit 1
    }
    Write-Host "Current directory is a Git repository: $PWD"
} catch {
    Write-Error "Git command not found or failed to determine if current directory is a Git repository. Error: $($_.Exception.Message)"
    exit 1
}

# Check for gh CLI presence and authentication
Write-Host "Checking for GitHub CLI (gh) and authentication status..."
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Error "GitHub CLI (gh) not found. Please install it."
    exit 1
}
try {
    # Test authentication by getting user info
    gh auth status --show-token | Out-Null
    Write-Host "GitHub CLI (gh) found and authenticated."
} catch {
    Write-Error "GitHub CLI (gh) is not authenticated. Please run 'gh auth login' and try again. Error: $($_.Exception.Message)"
    exit 1
}


# --- Git Operations ---

# 1. Check current status
Write-Host "Current Git status:"
git status

# 2. Stage all current work
Write-Host "Staging all current work..."
git add .

# 3. Commit current work with descriptive message
Write-Host "Committing current TransitTrack development..."
# Check if there are changes to commit before attempting commit
$gitStatusOutput = git status --porcelain
if ($gitStatusOutput) {
    git commit -m "feat: Complete TransitTrack implementation

- Add Supabase integration with real-time updates
- Implement GeoJSON-based transit line rendering
- Create responsive map with OpenStreetMap tiles
- Add collapsible sidebars with project details
- Include fallback system (Supabase -> GeoJSON -> Mock)
- Add environment configuration and validation
- Implement CRUD operations for transit projects
- Add connection status monitoring and error handling"
} else {
    Write-Host "No changes to commit. Skipping commit step."
}


# --- Create Remote Branches using gh CLI ---
Write-Host "Creating remote branches (dev, preview) on GitHub using gh CLI..."

# Get repository owner and name using gh repo view
try {
    $repoDetails = gh repo view --json owner,name | ConvertFrom-Json
    $repoOwner = $repoDetails.owner.login
    $repoName = $repoDetails.name
} catch {
    Write-Error "Could not retrieve repository details using 'gh repo view'. Ensure this is a GitHub repository and 'gh cli' is authenticated and has access. Error: $($_.Exception.Message)"
    exit 1
}
Write-Host "Detected repository: $($repoOwner)/$($repoName)"

# Fetch the SHA of the HEAD of the 'main' branch on remote
# This ensures new branches are created from a known, existing point
Write-Host "Fetching SHA of remote 'main' branch..."
$mainSha = gh api "repos/$repoOwner/$repoName/git/refs/heads/main" --jq '.object.sha' 2>$null # Redirect stderr to null
if (-not $mainSha) {
    Write-Error "Could not retrieve SHA for remote 'main' branch. Ensure 'main' exists on remote and 'gh CLI' is authenticated. This might also occur if the repo URL is incorrect or you lack permissions."
    exit 1
}
Write-Host "Remote 'main' SHA: $($mainSha)"

# Create dev branch on remote if it doesn't exist
Write-Host "Creating remote 'dev' branch..."
try {
    gh api "repos/$repoOwner/$repoName/git/refs" -f ref='refs/heads/dev' -f sha="$mainSha" 2>$null # Redirect stderr to null
    Write-Host "Remote 'dev' branch created (or already exists)."
} catch {
    Write-Host "Remote 'dev' branch might already exist or there was an issue creating it: $($_.Exception.Message). Continuing..."
}

# Create preview branch on remote if it doesn't exist
Write-Host "Creating remote 'preview' branch..."
try {
    gh api "repos/$repoOwner/$repoName/git/refs" -f ref='refs/heads/preview' -f sha="$mainSha" 2>$null # Redirect stderr to null
    Write-Host "Remote 'preview' branch created (or already exists)."
} catch {
    Write-Host "Remote 'preview' branch might already exist or there was an issue creating it: $($_.Exception.Message). Continuing..."
}
Write-Host "Remote branches creation attempted via gh CLI."

# --- End gh CLI Branch Creation ---


# 4. Create and switch to dev branch locally
Write-Host "Creating and switching to dev branch locally..."
git checkout -b dev

# 5. Push dev branch to remote
Write-Host "Pushing dev branch to remote..."
git push -u origin dev
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to push dev branch. Please check Git authentication and network."
    exit 1
}

# 6. Create preview branch from dev locally
Write-Host "Creating preview branch from dev locally..."
git checkout -b preview

# 7. Push preview branch to remote
Write-Host "Pushing preview branch to remote..."
git push -u origin preview
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to push preview branch. Please check Git authentication and network."
    exit 1
}

# 8. Switch back to main branch locally
Write-Host "Switching back to main branch locally..."
git checkout main

# 9. Reset main to clean state (keep only essential files)
Write-Host "Cleaning main branch..."

# Remove all tracked files from the index
git rm -r --cached .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to remove tracked files from index during cleaning. Aborting."
    exit 1
}
# Remove untracked files and directories from the working tree
git clean -fd
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to clean untracked files from working directory. Aborting."
    exit 1
}


# 10. Add back only essential files (the README.md)
Write-Host "Adding clean README.md back to main..."

# Create clean README for main branch using individual Add-Content calls
Set-Content -Path "README.md" -Value "# TransitTrack" -Encoding UTF8 -Force
Add-Content -Path "README.md" "" -Encoding UTF8 # Empty line
Add-Content -Path "README.md" "A modern web application for visualizing Greater Toronto Area (GTA) transit infrastructure projects with real-time construction progress tracking." -Encoding UTF8
Add-Content -Path "README.md" "" -Encoding UTF8 # Empty line
Add-Content -Path "README.md" "## Quick Start" -Encoding UTF8
Add-Content -Path "README.md" "" -Encoding UTF8 # Empty line
Add-Content -Path "README.md" '```bash' -Encoding UTF8 # Using single quotes for literal backticks
Add-Content -Path "README.md" "# Clone the repository" -Encoding UTF8
Add-Content -Path "README.md" "git clone <repository-url>" -Encoding UTF8
Add-Content -Path "README.md" "cd transittrack" -Encoding UTF8
Add-Content -Path "README.md" "" -Encoding UTF8 # Empty line
Add-Content -Path "README.md" "# Switch to development branch" -Encoding UTF8
Add-Content -Path "README.md" "git checkout dev" -Encoding UTF8
Add-Content -Path "README.md" "" -Encoding UTF8 # Empty line
Add-Content -Path "README.md" "# Install dependencies" -Encoding UTF8
Add-Content -Path "README.md" "npm install" -Encoding UTF8
Add-Content -Path "README.md" "" -Encoding UTF8 # Empty line
Add-Content -Path "README.md" "# Set up environment variables" -Encoding UTF8
Add-Content -Path "README.md" "cp .env.example .env.local" -Encoding UTF8
Add-Content -Path "README.md" "# Edit .env.local with your Supabase credentials" -Encoding UTF8
Add-Content -Path "README.md" "" -Encoding UTF8 # Empty line
Add-Content -Path "README.md" "# Start development server" -Encoding UTF8
Add-Content -Path "README.md" "npm run dev" -Encoding UTF8
Add-Content -Path "README.md" '```' -Encoding UTF8 # Using single quotes for literal backticks
Add-Content -Path "README.md" "`n<!-- Last updated by setup-transittrack-generic.ps1 on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss") -->" -Encoding UTF8


# 11. Stage and commit the new README.md
Write-Host "Staging and committing new README.md for main branch..."
git add README.md
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to stage README.md. Aborting."
    exit 1
}
$gitStatusPorcelain = git status --porcelain
if (-not ($gitStatusPorcelain | Select-String "^A\s+README.md|^M\s+README.md")) {
    Write-Host "No changes detected for README.md after staging. Skipping commit, assuming README is already clean or git add failed silently."
} else {
    git commit -m "docs: Update main branch README to clean state"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to commit README.md changes. Aborting."
        exit 1
    }
}


# 12. Push the cleaned main branch to remote
Write-Host "Force pushing cleaned 'main' branch to 'origin/main'..."
git push --force origin main # Use --force to overwrite remote main with the clean state. Use with caution!
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to force push 'main' branch. Please check Git authentication and network."
    exit 1
}

# --- Verification Steps ---

# 13. List all files in the dev branch (locally for content verification)
Write-Host "Listing all files in the local 'dev' branch:"
git ls-tree -r dev --name-only

# 14. List all remote branches (to confirm dev, preview, and main are there)
Write-Host "Listing all branches on remote 'origin' (confirming dev, preview, and clean main):"
git branch -r

# --- End Verification Steps ---

Write-Host "Git repository setup complete!"
