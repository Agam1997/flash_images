const { exec } = require("child_process");

function executeCommand(commandName) {
    
    return new Promise( async (resolve, rejects) => {
        try {
            console.log("commandName in execCommand : ", commandName);
            if(!commandName) resolve(false);

            await exec( commandName, async (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    resolve("unknown");
                }
                else if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    resolve("unknown");
                }
                else {
                    console.log(`stdout: ${stdout}`);
                    resolve(true);    
                }                
            });
        } catch (err ) {
            console.log("inside catch err of exec uname -a command");
            resolve("unknown");
        }
    });
}
module.exports = executeCommand
