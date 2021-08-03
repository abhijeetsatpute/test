var apiconnWsdl = require("apiconnect-wsdl");
var yaml 	    = require("js-yaml");
var fs          = require("file-system");
const _ = require('lodash');
//mixin all the methods into Lodash object
require('deepdash')(_);

async function wsdl2swagger(input){
	try {
			var wsdls = await apiconnWsdl.getJsonForWSDL(input);
			var filename = input.split('/').slice(-1)[0];
			// Get Services from all parsed WSDLs
			var serviceData = apiconnWsdl.getWSDLServices(wsdls);

			// Loop through all services and genereate yaml file
			for (var item in serviceData.services) {
			var serviceName = serviceData.services[item].service;
			var wsdlId = serviceData.services[item].filename;
			var wsdlEntry = apiconnWsdl.findWSDLForServiceName(wsdls, serviceName);
			var swagger = apiconnWsdl.getSwaggerForService(
				wsdlEntry,
				serviceName,
				wsdlId
			);
			swagger = _.omitDeep(swagger, /\.?(example|x-ibm|xml|x-xsi-type)/);
			swagger.produces = ['application/json'];
			swagger.consumes = ['text/json'];
			fs.writeFile("./converted/"+filename.split('.')[0]+".yaml", modify(yaml.safeDump(swagger)));
		}
	} catch (err) {

	}
}

function modify(swagger){
	Array.prototype.insert = function(index, item) {
		this.splice(index, 0, item);
	  };
	var lines = swagger.split('\n');
	for (let i =lines.length; i>=0; i--){
		if(lines[i] == "swagger: '2.0'"){
			lines.insert(i, '---');
		} else if (lines[i] == "info:"){
			lines.insert(i, `
################################################################################
#                       API Information                                        #
################################################################################`);
		} else if (lines[i] == "schemes:"){
			lines.insert(i, `
################################################################################
#                  Host, Base Path, Schemes and Content Types                  #
################################################################################`);
		} else if (lines[i] == "schemes:"){
			lines.insert(i, `
################################################################################
#                  Host, Base Path, Schemes and Content Types                  #
################################################################################`);
		} else if (lines[i] == "securityDefinitions:"){
			lines.insert(i, `
################################################################################
#                                  Security                                    #
################################################################################`);
		} else if (lines[i] == "parameters:"){
			lines.insert(i, `
################################################################################
#                                   Parameters                                 #
################################################################################`);
		} else if (lines[i] == "paths:"){
			lines.insert(i, `
################################################################################
#                      Paths                                                   #
################################################################################`);
		} else if (lines[i] == "responses:"){
			lines.insert(i, `
################################################################################
#                           Responses                                          #
################################################################################`);
		} else if (lines[i] == "definitions:"){
			lines.insert(i, `
################################################################################
#                           Definitions                                        #
################################################################################`);
		}
	}

	return lines.join('\n');
}

//wsdl2swagger('C:/Users/abhij/Desktop/wsdl/samples/nest/3.wsdl');

exports.wsdl2swagger = wsdl2swagger;