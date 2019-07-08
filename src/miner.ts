import { Observable } from '@reactivex/rxjs';
import { Doc } from 'feedbackfruits-knowledge-engine';
const fs = require('fs');
const fastcsv = require('fast-csv');
var request = require('request');


var fileStream = fs.createReadStream('data.csv','utf8');
var csvStream = fastcsv.parse({headers:true});
fileStream.pipe(csvStream);
var i = 0;
// Export function to be used in other files
// Function that mines the resources of TU Delft
export function mine(): Observable<Doc> {
  return new Observable(observer => {
    try {
      csvStream.on('data', async (row)=>{
        csvStream.pause();
        console.log("Resource ",i);
        try {
          const resource = await mapRecord(row);
          if (resource != null) {
            observer.next(resource);
            i++;
          }
        } catch(err) {
          console.error(err);
          throw err;
        }
        csvStream.resume();
      });
      csvStream.on('error',(error)=>{
        console.log(error);
      });
      csvStream.on('end',(rowcount)=>{
        console.log("Csv successfully processed!");
        console.log("Parsed ",rowcount," documents");
        observer.complete();
      });
    } catch(e) {
      observer.error(e);
    }
  });
}

function parseAuthors(authorString: string): string[] {
  return authorString.split(" (author),").map(author => {
    return author.replace(" (author)", "");
  });
}

function dateToISO8601(dateString): string {
  const parts = dateString.split('-');

  let newDateString;
  if (parts.length === 1) {
    // Only year
    const year = parseInt(parts[0]) < 30 ? `20${parts[0]}` : `19${parts[0]}`;
    newDateString = year;
  } else if (parts.length === 2) {
    // const year = parseInt(parts[1]) < 30 ? `20${parts[1]}` : `19${parts[1]}`;
    newDateString = dateString;
  } else if (parts.length === 3) {
    if (parts[0].length === 4) newDateString = dateString;
    else {
      const year = parseInt(parts[2]) < 30 ? `20${parts[2]}` : `19${parts[2]}`;
      newDateString = `${year}-${parts[1]}-${parts[0]}`;
    }
  } else {
    throw new Error(`Unknown date format: ${dateString}`);
  }

  console.log('Mapping date from:', parts, " to ", newDateString);
  const date = new Date(newDateString);
  return date.toISOString();
}

async function mapRecord(record) {
  if (record.existence === "yes"){
    return {
      "@id": record.downloadUrl,
      "@type": [
           "Resource", "Document"
       ],
       "name": record.title,
       "description": record.abstract,
       "sourceOrganization": "http://repository.tudelft.nl",
       "license": record.license,
       "inLanguage": record.language,
       "topic" : record.url,
       ...(record.author !== "Undetermined, U. (author)" ? { "author": parseAuthors(record.author) } : {}),

       // "contributor": record.contributors,
       "learningResourceType": record.type,
       // "contentLength" : record.length,

       ...(record.subjects.length > 0 ? { "keywords": record.subjects.split(',') } : {}),
       ...(record.creationDate.length > 0 ? { "dateCreated" : dateToISO8601(record.creationDate) } : {}),
       };
  }
  else{
    return null;
  }
}
