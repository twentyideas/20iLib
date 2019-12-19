
# @20i/scripts
This package aims to provide useful scripts & functions to quickly write cross platform node-js scripts. 

Included in the project.

 - cmd
	 - runCommand
	 - runCommandInteractive
 - git
	- cleanLocalBranches	// runnable if env has --run=true
	- getCurrentGitBranch // runnable if env has --run=true
-	helpers
	-	file
		-	filesInDirectory
        -   dirsInDirectory
        -   dirExists
        -   fileExists
        -   writeFile
        -   copyDir
        -   copyFile
        -   removeDir
        -   createDir
        -   removeFile
        -   readFile
        -   getFileOrFolderName
        -   getTemplate
	-	string
        -   containsWhitespace
        -   containsNumbers
        -   containsAlphabets
        -   isOnlyAlphanumeric
        -   isOnlyNumeric
        -   isOnlyAlpha
        -   isInteger
        -   replace
	-	env
        -   onProcessExit
        -   getEnvVars
