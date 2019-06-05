import { Observable } from '@reactivex/rxjs';
import { Doc } from 'feedbackfruits-knowledge-engine';
import { OaiPmh } from 'oai-pmh' // package for metadata extraction based on OAI protocol
const fs = require('fs');
var download = require('download-pdf');
const pdf = require('pdf-parse');
var urlExists = require('url-exists');


const url = `http://oai.tudelft.nl/ir`; // url to access TU Delft resources

// Initialization of variables
var i = 0;
var myArray = ['master thesis', 'bachelor thesis', 'doctoral thesis', 'journal article','review','conference paper','book','book chapter','public lecture'];

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
  var answer = "";
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
function GetEducationalLevel(id,record){
  if (id !== null){
    if ( Array.isArray(record.metadata["oai_dc:dc"]["dc:type"]) ){
      if ( myArray.includes(record.metadata["oai_dc:dc"]["dc:type"][0]) ){
        return record.metadata["oai_dc:dc"]["dc:type"][0];
      }
    }
    else if (record.metadata["oai_dc:dc"]["dc:type"] === undefined){
      return null;
    }
    else if ( myArray.includes(record.metadata["oai_dc:dc"]["dc:type"]) ){
      return record.metadata["oai_dc:dc"]["dc:type"];
    }
  }
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


// Function to get the length of the resource
async function ExtractLength(url, destination, flnm){
  var options ={
    directory: destination,
    filename: flnm,
  }
  return new Promise(async (resolve, reject) => {
    var numPages;
    await download(url, options,async function(error){
      if (error){
        console.log("Download error: ", error);
        return reject(error);
      }
      await fs.readFile(destination+flnm, async function(err,dataBuffer){
        if (err){
          console.log("Read file error: ", err);
          return reject(error);
        }
        try{
          var data = await pdf(dataBuffer); //.then(function(data){
          numPages  = data.numpages;
          console.log("Number of pages: ", numPages);
          return resolve(numPages);
        }
        catch(error2){
          console.log("Parsing PDF Error: ",error2);
          return resolve(null);
        }
      });
    });
  });
}


//Function to check if resource exists
async function CheckExistence(url){
  return new Promise(async (resolve, reject) => {
    await urlExists(url,function(error,exists){
      if (error){
        console.log("Error: ",error);
        return reject(error);
      }
      console.log(exists);
      return resolve(exists);
    });
  });
}


// Export function to be used in other files
// Function that mines the resources of TU Delft
export function mine(): Observable<Doc> {
  return new Observable(observer => {
    try {
      // Set up parameters to extract metadata based on OAI protocol
      const oaiPmh = new OaiPmh(url);
      console.log(Object.keys(oaiPmh), OaiPmh);
      const recordIterator = oaiPmh.listRecords({
        metadataPrefix: 'oai_dc',
      });

      // Loop to go through all resources one by one
      (async () => {
        for await (const record of recordIterator) {
          //if (i > 4) break;
          //console.log(record);
          const resource = await mapRecord(record);
          // Only send the record that can successfully be mapped to resources
          if (resource != null) observer.next(resource);
        }
        console.log("Parsed ",i," documents");
        observer.complete();
      })()
    } catch(e) {
      observer.error(e);
    }
  });
}

// TODO: @Georgia: Expand this as needed to test data that is sent over the bus contains all the required properties.
// Try commenting in the title below and see how the test fails after that and can be fixed by checking the title in the test.
// Then add all the other missing properties here and in the test to complete the miner.
async function mapRecord(record) {
  if (!('metadata' in record && typeof record.metadata == 'object' && 'oai_dc:dc' in record.metadata)) return null;
  var numOfTopics, uid, urlDownload, rights, creatDate, lngth, existence;
  var educationalLevel = null;
  var id = null;
  // Map only english resources
  if (record.metadata["oai_dc:dc"]["dc:language"] === "en"){
    //Check if resource url exists and create new download url
    if (record.metadata["oai_dc:dc"]["dc:identifier"] === undefined){
      id = null;
      urlDownload = null;
    }
    else if (Array.isArray(record.metadata["oai_dc:dc"]["dc:identifier"])){
      for (var j=0; j<(record.metadata["oai_dc:dc"]["dc:identifier"]).length; j++){
        if (record.metadata["oai_dc:dc"]["dc:identifier"][j].includes("http")) {
          id = record.metadata["oai_dc:dc"]["dc:identifier"][j];
          uid = (id.split("nl/"))[1];
          urlDownload = "https://repository.tudelft.nl/islandora/object/"+uid+"/datastream/OBJ/download";
        }
      }
    }
    else{
      id = record.metadata["oai_dc:dc"]["dc:identifier"];
      uid = (id.split("nl/"))[1];
      urlDownload = "https://repository.tudelft.nl/islandora/object/"+uid+"/datastream/OBJ/download";
    }

    // Checking the type of resource
    educationalLevel = GetEducationalLevel(id, record);

    // Check if the resource exists
    existence = await CheckExistence(urlDownload);

    // If the resource is in english, a url for it exists and it is of a specific type
    if ( id !== null && educationalLevel !== null && existence !== false){
      console.log("Resource: ", i);
       i++;
       // Getting the number of topics
       numOfTopics = CalculateNumberOfTopics(record);
       // Find copyright license
       rights = FindCopyrightLicense(record);
       // Find creation date
       creatDate = GetCreationDate(record);
       // Find length of the pdf
       //lngth = await ExtractLength(urlDownload,"C:/tmp/", "myFile.pdf");
       lngth = await ExtractLength(urlDownload, "C:/tmp/", uid.replace("-", "_") + ".pdf");

       return {
         "@id": id, //[].concat(record.metadata["oai_dc:dc"]["dc:identifier"]).slice(-1)[0], // This hackyness is because the identifier is sometimes an array
         "@type": [
           "Resource", "Document"
         ],
         "title": (record.metadata["oai_dc:dc"]["dc:title"] === undefined) ? null : record.metadata["oai_dc:dc"]["dc:title"],
         "language": record.metadata["oai_dc:dc"]["dc:language"],
         "copyrights": rights,
         "abstract": (record.metadata["oai_dc:dc"]["dc:description"] === undefined) ? null : record.metadata["oai_dc:dc"]["dc:description"],
         "author": (record.metadata["oai_dc:dc"]["dc:creator"] === undefined) ? null : record.metadata["oai_dc:dc"]["dc:creator"],
         "organization": "Delf University of Technology",
         "contributors": (record.metadata["oai_dc:dc"]["dc:contributor"] === undefined) ? null : record.metadata["oai_dc:dc"]["dc:contributor"],
         "subjectTopics": (record.metadata["oai_dc:dc"]["dc:subject"] === undefined) ? null :record.metadata["oai_dc:dc"]["dc:subject"],
         "NumberOfTopics": numOfTopics,
         "EducationalLevel" : educationalLevel,
         "DownloadUrl" : urlDownload,
         "CreationDate" : creatDate,
         "Length" : lngth
       };
     }
  }
  else{
    return null;
  }
}
