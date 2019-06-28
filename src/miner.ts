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
        const resource = await mapRecord(row);
        if (resource != null) observer.next(resource);
        i++;
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

// TODO: @Georgia: Expand this as needed to test data that is sent over the bus contains all the required properties.
// Try commenting in the title below and see how the test fails after that and can be fixed by checking the title in the test.
// Then add all the other missing properties here and in the test to complete the miner.
async function mapRecord(record) {
  if (record.existence === "yes"){
    return {
      "@id": record.url,
      "@type": [
           "Resource", "Document"
       ],
       "title": record.title,
       "language": record.language,
       "copyrights": record.license,
       "abstract": record.abstract,
       "author": record.author,
       "organization": record.organization,
       "contributors": record.contributors,
       "subjectTopics": record.subjects,
       "NumberOfTopics": record.numOfTopics,
       "EducationalLevel" : record.educationLevel,
       "Type": record.type,
       "DownloadUrl" : record.downloadUrl,
       "CreationDate" : record.creationDate,
       "Length" : record.length
       };
  }
  else{
    return null;
  }
}
