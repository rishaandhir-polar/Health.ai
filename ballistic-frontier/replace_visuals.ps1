$filePath = 'c:\Users\risha\Documents\Rishaan-Projects\health-ai-app\ballistic-frontier\index.html'
$tempVisualsPath = 'c:\Users\risha\Documents\Rishaan-Projects\health-ai-app\ballistic-frontier\temp_visuals.js'

if (Test-Path $filePath) {
    $content = [System.IO.File]::ReadAllText($filePath)
    $newVisuals = [System.IO.File]::ReadAllText($tempVisualsPath)
    
    # Regex to find the block starting with TOWER_TYPES.turret.draw and ending before ENEMY_TYPES
    $pattern = '(?s)TOWER_TYPES\.turret\.draw = .*?const ENEMY_TYPES = \{'
    
    if ($content -match $pattern) {
        $replacement = $newVisuals + "`r`n`r`n        const ENEMY_TYPES = {"
        $newContent = $content -replace $pattern, $replacement
        [System.IO.File]::WriteAllText($filePath, $newContent)
        Write-Output "Successfully replaced visuals."
    } else {
        Write-Error "Could not find the tower drawing block pattern."
    }
} else {
    Write-Error "File not found: $filePath"
}
