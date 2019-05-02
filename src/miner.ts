import { Observable } from '@reactivex/rxjs';
import { Doc } from 'feedbackfruits-knowledge-engine';
import { OaiPmh } from 'oai-pmh'

const url = `http://oai.tudelft.nl/ir`;

export function mine(): Observable<Doc> {
  return new Observable(observer => {
    try {
      const oaiPmh = new OaiPmh(url)
      console.log(Object.keys(oaiPmh), OaiPmh);
      const recordIterator = oaiPmh.listRecords({
        metadataPrefix: 'oai_dc',
      });

      (async () => {
        for await (const record of recordIterator) {
          const resource = mapRecord(record);
          // console.log(resource);
          // Only send the record that can successfully be mapped to resources
          if (resource != null) observer.next(resource);
        }

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
function mapRecord(record) {
  if (!('metadata' in record && typeof record.metadata == 'object' && 'oai_dc:dc' in record.metadata)) return null;
  return {
    "@id": [].concat(record.metadata["oai_dc:dc"]["dc:identifier"]).slice(-1)[0], // This hackyness is because the identifier is sometimes an array
    "@type": [
      "Resource", "Document"
    ],

    // "title": record.metadata["oai_dc:dc"]["dc:title"],
  };
}
