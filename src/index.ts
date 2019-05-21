// Import package that allows meta-data harvesting according to the OAI protocol
import { OaiPmh } from 'oai-pmh'

var i = 0;
var myArray = ['master thesis', 'bachelor thesis', 'doctoral thesis', 'journal article','review','conference paper','book','book chapter','public lecture'];
const url = 'http://oai.tudelft.nl/ir';

function getMetadata(item, index){
  if ('$' in item.header && item.header['$'] == undefined && item.header['$']['status'] == 'deleted'){
    console.log("Undefined item", index);
  }
  else if (item.metadata == undefined){
    console.log ("Undefined metadata",index);
  }
  else{
    if ( (item.metadata["oai_dc:dc"]["dc:language"] === "en") ){
      if (Array.isArray(item.metadata["oai_dc:dc"]["dc:type"])){
        if ( myArray.includes(item.metadata["oai_dc:dc"]["dc:type"][0]) ){
          console.log("Item: ", i);
          (item.metadata["oai_dc:dc"]["dc:title"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:title"]);
          (item.metadata["oai_dc:dc"]["dc:rights"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:rights"]);
          if (Array.isArray(item.metadata["oai_dc:dc"]["dc:subject"])){
            console.log(item.metadata["oai_dc:dc"]["dc:subject"]);
            console.log((item.metadata["oai_dc:dc"]["dc:subject"]).length);
          }
          else{
            (item.metadata["oai_dc:dc"]["dc:subject"] === undefined)? console.log(null):console.log((item.metadata["oai_dc:dc"]["dc:subject"]));
          }
          (item.metadata["oai_dc:dc"]["dc:date"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:date"]);
          (item.metadata["oai_dc:dc"]["dc:type"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:type"]);
          (item.metadata["oai_dc:dc"]["dc:creator"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:creator"]);
          if(Array.isArray(item.metadata["oai_dc:dc"]["dc:identifier"])){
            console.log(item.metadata["oai_dc:dc"]["dc:identifier"][0]);
          }
          else{
            (item.metadata["oai_dc:dc"]["dc:identifier"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:identifier"]);
          }
          (item.metadata["oai_dc:dc"]["dc:language"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:language"]);
          (item.metadata["oai_dc:dc"]["dc:description"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:description"]);
          (item.metadata["oai_dc:dc"]["dc:contributor"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:contributor"]);
          i++;
        }
      }
      else{
        if (myArray.includes(item.metadata["oai_dc:dc"]["dc:type"]) || item.metadata["oai_dc:dc"]["dc:type"] === undefined){
          console.log("Item: ", i);
          (item.metadata["oai_dc:dc"]["dc:title"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:title"]);
          (item.metadata["oai_dc:dc"]["dc:rights"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:rights"]);
          if (Array.isArray(item.metadata["oai_dc:dc"]["dc:subject"])){
            console.log((item.metadata["oai_dc:dc"]["dc:subject"]).length);
          }
          else{
            (item.metadata["oai_dc:dc"]["dc:subject"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:subject"]);
          }
          (item.metadata["oai_dc:dc"]["dc:date"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:date"]);
          (item.metadata["oai_dc:dc"]["dc:type"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:type"]);
          (item.metadata["oai_dc:dc"]["dc:creator"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:creator"]);
          if(Array.isArray(item.metadata["oai_dc:dc"]["dc:identifier"])){
            console.log(item.metadata["oai_dc:dc"]["dc:identifier"][0]);
          }
          else{
            (item.metadata["oai_dc:dc"]["dc:identifier"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:identifier"]);
          }
          (item.metadata["oai_dc:dc"]["dc:language"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:language"]);
          (item.metadata["oai_dc:dc"]["dc:description"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:description"]);
          (item.metadata["oai_dc:dc"]["dc:contributor"] === undefined)? console.log(null):console.log(item.metadata["oai_dc:dc"]["dc:contributor"]);
          i++;
        }
      }
    }
  }
}

async function main () {

  const oaiPmh = new OaiPmh(url);
  const identifierIterator = oaiPmh.listRecords({
    metadataPrefix: 'oai_dc',
  });
  for await (const identifier of identifierIterator) {
    try {
      getMetadata(identifier, i);
      //if (i>100) break;
    }
    catch(error){
      console.log("Error: ",error);
    }

  }
  console.log(i);
}

main().catch(console.error)
