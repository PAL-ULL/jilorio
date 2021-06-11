const Axios = require('axios');
var util = require('util');
const querystring = require('querystring');
const fs = require('fs');
const { response } = require('express');
const aInstance = Axios.create({
    withCredentials: true,
});



class CIMExampleNode {

   
    constructor() {
        this.config = this.getConfig();
        this.token = null;
    }

    getConfig() {
        let rawdata = fs.readFileSync('./api/config.json');
        return JSON.parse(rawdata);
    }

    setToken(token) {
        this.token = token;
    }


    static dump(data) {
        const len = data.length;
        const keys = data.length ? Object.keys(data[0]) : null;

        console.info(`ARRAY LENGTH ${len}\n`);
        console.info(`OBJECT KEYS`, keys);
        console.info('\n');
        console.info(data);
    }

    getLoginData() {

        const { authConfig, authData } = this.config;

        return {
            'grant_type': authConfig.grant_type,
            'client_id': authConfig.client_id,
            'client_secret': authConfig.client_secret,
            'username': authData.username,
            'password': authData.password
        }
    }


 
    async login() {

        const { authConfig } = this.config;
        const authUrl = `${authConfig.url_prefix}${authConfig.auth_url}`;
        const loginData = this.getLoginData();
        const urlEncodedData = querystring.stringify(loginData);
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        // console.info(loginData);
        aInstance({
            "method": 'post',
            "url": authUrl,
            "data": urlEncodedData,
            "headers": headers
        })

            .then((response) => {
                const { access_token, expires_in } = response.data;
               
                console.info(`ACCESS_TOKEN ${access_token}`);
                console.info(`EXPIRES IN ${expires_in}s`);
                
                this.setToken(access_token);
                postLoginCallback();
             
            })
            .catch((response) => {
                console.error(response);
            });
    }

    async getTestData () {

        const { authConfig } = this.config;

        const testingUrl = `${authConfig.url_prefix}${authConfig.testing_url}`;

        const headers = {'Authorization': `Bearer ${this.token}` };

        console.info(`\r\nFETCHING ${testingUrl}\r\n`);

        return await aInstance({
            method: 'GET',
            "url": testingUrl,
            headers: headers
        })
            .then((response) => {
                return response.data;
            })
            .catch(function (response) {
                //handle error
                console.log(response);
            });

    }


}

module.exports = CIMExampleNode;