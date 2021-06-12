'use strict';

// Lang template
const espTemplate = require("../templates/esp.json");

// CIM NodeJS API Service
const CIMApiService = require('cim-api-service/src/CIMApiService').CIMApiService;
const cimConfig = require('../config/cim.js').getConfig();
const ApiService = new CIMApiService(cimConfig);

/**
 * @type {{cimTest: controller.cimTest}}
 */
let controller = {

    /**
     * CIM INTEGRATION TESTING VIEW
     *
     * @param req
     * @param res
     * @param res.query.resource CIM API RESOURCE {ingredient, dish, menu}
     *
     * @returns {Promise<void>}
     */
    cimTest: async function (req, res) {

        const RESOURCE = req.query.resource;
        const ROUTE_PREFIX = "/api/";
        const ROUTE_POSTFIX = "/transformed_list?context=ica";
        const FETCH_URL = `${ROUTE_PREFIX}${RESOURCE}${ROUTE_POSTFIX}`;
        
        ApiService.init().then((apiServiceInstance) => {

            apiServiceInstance.getData(FETCH_URL).then(resultArray => {
                //CIMApiService.dump(resultArray);
                res.render('cim/cim-test.ejs', {
                    items: {
                        req: req,
                        resource: RESOURCE,
                        myObject: espTemplate,
                        data: resultArray
                    }
                });


            })

        });
    }
};


module.exports = controller;

