// Import package that allows meta-data harvesting according to the OAI protocol
import { OaiPmh } from 'oai-pmh';
const fastcsv = require('fast-csv');
const fs = require('fs');
const ws = fs.createWriteStream("out.csv");

var i = 0;
var myArray = ['master thesis', 'bachelor thesis', 'report', 'doctoral thesis', 'journal article','review','conference paper','book','book chapter','public lecture'];
const url = 'http://oai.tudelft.nl/ir';


// Function to get the abstract of the resource clean from html tags
function GetAbstract(item){
  var abstr = (item.metadata["oai_dc:dc"]["dc:description"] === undefined) ? null : item.metadata["oai_dc:dc"]["dc:description"];
  if (Array.isArray(abstr)){
    for (var t = 0; t < abstr.length; t++){
      abstr[t] = abstr[t].replace(/(<([^>]+)>)/ig,"");
    }
  }
  else if(abstr !== null){
    abstr = abstr.replace(/(<([^>]+)>)/ig,"");
  }
  return abstr;
}

// Function to get the creation date of a resources
function GetCreationDate(record){
  if (record.metadata["oai_dc:dc"]["dc:date"] === undefined){
      return null;
  }
  else if ( Array.isArray(record.metadata["oai_dc:dc"]["dc:date"]) ){
    return record.metadata["oai_dc:dc"]["dc:date"][0];
  }
  else{
    return record.metadata["oai_dc:dc"]["dc:date"];
  }
}


// Function to get copyrights from string
function GetRightsFromString(record){
  if ( record.includes("CC-BY-NC-ND") || record.includes("BY-NC-ND") || record.includes("BY NC ND") || record.includes("NonCommercial-NoDerivs") ){
    return "CC-BY-NC-ND";
  }
  else if ( record.includes("CC-BY-NC-SA") || record.includes("BY-NC-SA") || record.includes("BY NC SA") || record.toLowerCase().includes("NonCommercial-ShareAlike") || record.toLowerCase().includes("noncommercial share alike") || record.toLowerCase().includes("non-commercial share alike") ){
    return "CC-BY-NC-SA";
  }
  else if ( record.includes("CC-BY-NC") || record.includes("BY-NC") || record.includes("BY NC") || record.toLowerCase().includes("noncommercial") || record.toLowerCase().includes("non commercial") || record.toLowerCase().includes("non-commercial")){
    return "CC-BY-NC";
  }
  else if ( record.includes("CC-BY-ND") || record.includes("BY-ND") || record.includes("BY ND") || record.includes("by-nd") ){
    return "CC-BY-ND";
  }
  else if ( record.includes("CC-BY-SA") || record.includes("BY-SA") || record.includes("BY SA") ){
    return "CC-BY-SA";
  }
  else if ( record.includes("CC-BY") || record.includes("BY") || record.includes("/by") || record.toLowerCase().includes("creative commons 3.0") || record.toLowerCase().includes("license 4.0") || record.toLowerCase().includes("attribution 3.0") || record.toLowerCase().includes("attribution 4.0") || record.toLowerCase().includes("provided the original work is properly cited") || record.toLowerCase().includes("permits unrestricted use, distribution, and reproduction in any medium, provided") ){
    return "CC-BY";
  }
  else if ( record.includes("CC0") || record.includes("(c0)") ){
    return "CC0";
  }
  else if ( record.toLowerCase().includes("(c)") || record.toLowerCase().includes("©") ){
    return "C";
  }
  else{
    return null;
  }
}

// Function to get the copyrights from an array
function GetRightsFromArray(record){
  var answer = null;
  for (var k = 0; k<record.metadata["oai_dc:dc"]["dc:rights"].length; k++){
    answer = (GetRightsFromString(record.metadata["oai_dc:dc"]["dc:rights"][k]) === null) ? answer : GetRightsFromString(record.metadata["oai_dc:dc"]["dc:rights"][k]) ;
  }
  return answer;
}


// Function that returns the copyright license that corresponds to a resource
function FindCopyrightLicense(record){
  if (record.metadata["oai_dc:dc"]["dc:rights"] !== undefined){
     if ( Array.isArray(record.metadata["oai_dc:dc"]["dc:rights"]) ){
       return GetRightsFromArray(record);
     }
     else{
       return GetRightsFromString(record.metadata["oai_dc:dc"]["dc:rights"]);
     }
   }
   else if (record.metadata["oai_dc:dc"]["dc:rights"] === undefined){
     return null;
   }
}


// Function to calculate the number of topics
function CalculateNumberOfTopics(item){
  // Number of topics
      if (Array.isArray(item.metadata["oai_dc:dc"]["dc:subject"])){
        return item.metadata["oai_dc:dc"]["dc:subject"].length;
      }
      else if (item.metadata["oai_dc:dc"]["dc:subject"] === undefined){
        return null;
      }
      else if ( item.metadata["oai_dc:dc"]["dc:subject"].includes(",") ){
        return item.metadata["oai_dc:dc"]["dc:subject"].split(",").length;
      }
      else if ( item.metadata["oai_dc:dc"]["dc:subject"].includes("/") ){
        return item.metadata["oai_dc:dc"]["dc:subject"].split("/").length;
      }
      else if ( item.metadata["oai_dc:dc"]["dc:subject"].includes("·") ){
        return item.metadata["oai_dc:dc"]["dc:subject"].split("·").length;
      }
      else if ( item.metadata["oai_dc:dc"]["dc:subject"].includes(";") ){
        return item.metadata["oai_dc:dc"]["dc:subject"].split(";").length;
      }
      else if ( item.metadata["oai_dc:dc"]["dc:subject"].toLowerCase().includes("oa-fund") || item.metadata["oai_dc:dc"]["dc:subject"].toLowerCase().includes("library") ){
        return null;
      }
      else if ( item.metadata["oai_dc:dc"]["dc:subject"].includes(" ") ){
        return item.metadata["oai_dc:dc"]["dc:subject"].split(" ").length;
      }
      else{
        return 1;
      }
}


// Function to get the educational Level
function GetEducationalLevel(id, record){
  if (id !== null){
    if ( Array.isArray(record.metadata["oai_dc:dc"]["dc:type"]) ){
      if ( myArray.includes(record.metadata["oai_dc:dc"]["dc:type"][0]) ){
        return record.metadata["oai_dc:dc"]["dc:type"][0];
      }
      else{
        return null;
      }
    }
    else if ( myArray.includes(record.metadata["oai_dc:dc"]["dc:type"]) ){
      return record.metadata["oai_dc:dc"]["dc:type"];
    }
    else {
      return null;
    }
  }
}

// Function to get identifiers of a resources
function getIdentifiers(item){
  var identifiers = [];
  var url2, uid, newUrl
  // If the identifier is in an array
  if ( Array.isArray(item.metadata["oai_dc:dc"]["dc:identifier"]) ) {
    for (var j=0; j<(item.metadata["oai_dc:dc"]["dc:identifier"]).length; j++) {
      if (item.metadata["oai_dc:dc"]["dc:identifier"][j].includes("http")) {
        url2 = item.metadata["oai_dc:dc"]["dc:identifier"][j];
        uid = (url2.split("nl/"))[1];
        newUrl = "https://repository.tudelft.nl/islandora/object/"+uid+"/datastream/OBJ/download";
      }
    }
  }
  // If the identifier is in a simple string
  else if (item.metadata["oai_dc:dc"]["dc:identifier"] !== undefined) {
    url2 = item.metadata["oai_dc:dc"]["dc:identifier"];
    uid = (url2.split("nl/"))[1];
    newUrl = "https://repository.tudelft.nl/islandora/object/"+uid+"/datastream/OBJ/download";
  }
  // If the identifier is undefined
  else{
    url2 = null;
    uid = null;
    newUrl = null;
  }
  identifiers.push(url2); identifiers.push(uid); identifiers.push(newUrl);
  //console.log(identifiers);
  return identifiers;
}


function getMetadata(item, index){
  var id, language ,existingUrl , title, copyrights, abstract, author, organization, contributors, subjects, numOfTopics, educationLevel, downloadUrl, creationDate, identifiers;
  var line = {resourceId: "",
              url: "",
              downloadUrl: "",
              language: "",
              type: "",
              educationLevel: "",
              title: "",
              author: "",
              organization: "",
              contributors: "",
              abstract: "",
              license: "",
              subjects: "",
              numOfTopics: "",
              creationDate: ""
            };
  // The resource is deleted or undefined
  if ('$' in item.header && item.header['$'] === undefined && item.header['$']['status'] === 'deleted'){
    //console.log("Undefined item");
    return null;
  }
  // The resoure has no metadata
  else if (item.metadata === undefined){
    //console.log ("Undefined metadata");
    return null;
  }
  else{
    // Get only the english resources
    if ( item.metadata["oai_dc:dc"]["dc:language"] === "en" ){
      identifiers = getIdentifiers(item);
      // Get the two urls and the id of the resource
      existingUrl = identifiers[0]; id = identifiers[1]; downloadUrl = identifiers[2];
      educationLevel = GetEducationalLevel(existingUrl, item);

      if (existingUrl !== null && educationLevel !== null){
        console.log("Resource: ", i);
        // Add id, url and download url to the object
       line.resourceId = id; line.url = existingUrl; line.downloadUrl = downloadUrl;
       line.educationLevel = "Unknown"; //educationLevel;
       line.language = "en";
       // Get the type of resource
       line.type = educationLevel;
       // Getting the number of topics
       line.numOfTopics = CalculateNumberOfTopics(item);
       // Find copyright license
       line.license = FindCopyrightLicense(item);
       // Find creation date
       line.creationDate = GetCreationDate(item);
       // Get title of the resource
       line.title = (item.metadata["oai_dc:dc"]["dc:title"] === undefined) ? null : item.metadata["oai_dc:dc"]["dc:title"];
       // Get the abstract of the resource
       line.abstract = GetAbstract(item);
       // Get the author of the resource
       line.author = (item.metadata["oai_dc:dc"]["dc:creator"] === undefined) ? null : item.metadata["oai_dc:dc"]["dc:creator"];
       // Get the contributors of the resource
       line.contributors = (item.metadata["oai_dc:dc"]["dc:contributor"] === undefined) ? null : item.metadata["oai_dc:dc"]["dc:contributor"];
       // Get the subject topics of the resource
       line.subjects = (item.metadata["oai_dc:dc"]["dc:subject"] === undefined) ? null : item.metadata["oai_dc:dc"]["dc:subject"];
       // Get the organization of the resources
       line.organization = "Delf University of Technology";
       //console.log(line);
       i++;
       return line;
      }
    }
  }
}

// Main function of the program
async function main () {
  var data = [];
  // Use tudelft link to access metadata for harvesting with OAI protocol
  const oaiPmh = new OaiPmh(url);
  const identifierIterator = oaiPmh.listRecords({
    metadataPrefix: 'oai_dc',
  });
  // Loop to go through all the resources of tudelft one by one
  for await (const identifier of identifierIterator) {
    try {
      var record = await getMetadata(identifier, i);
      if (record !== null ){
        data.push(record);
      }
    }
    catch(error){
        console.log("Error appeared: ",error);
    }
  }
  // Print the number of resources we accessed for their properties
  console.log( "Finished and have gone through ", i," resources");
  console.log(data);
  fastcsv.write(data, { headers: true }).pipe(ws);
  console.log('The CSV file was written successfully');
}

main().catch(console.error);
