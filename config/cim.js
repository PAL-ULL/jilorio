const cimConfigPath = "./config/config.json";
const fs = require('fs');

//TODO: ¿move external service config to 'vendor' directory?
module.exports = {
    getConfig: () => {
        let rawData = fs.readFileSync(cimConfigPath);
       
        return JSON.parse(rawData);
    }
};