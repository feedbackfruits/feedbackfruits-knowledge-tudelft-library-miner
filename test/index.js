import test from 'ava';

import memux from 'memux';
import init from '../dist';
import { NAME, KAFKA_ADDRESS, OUTPUT_TOPIC } from '../dist/config';

test('it exists', t => {
  t.not(init, undefined);
});

// TODO: @Georgia: Expand this as needed to test data that is sent over the bus contains all the required properties
const Resource = {
  '@id': 'http://resolver.tudelft.nl/uuid:000045fb-4762-4985-a423-688824607d8c',
  "@type": [
    "Resource",
    "Document"
  ],

  // title: "My Title",

};

test('it works', async (t) => {
  try {
    let _resolve, _reject;
    const resultPromise = new Promise((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });

    let resolved = false;
    const receive = (message) => {
      console.log('Received message!', message);
      if (!resolved) {
        resolved = true;
        _resolve(message);
      }
    };

    await memux({
      name: 'dummy-broker',
      url: KAFKA_ADDRESS,
      input: OUTPUT_TOPIC,
      receive,
      options: {
        concurrency: 1
      }
    });

    // Do not await init here, it will wait for the miner to finish mining before resolving
    init({
      name: NAME,
    });

    const result = await resultPromise;
    console.log('Result data:', JSON.stringify(result.data));
    return t.deepEqual(result, {
      action: 'write',
      label: "feedbackfruits-knowledge-tudelft-library-miner",

      key: Resource["@id"],
      data: Resource
    });
  } catch(e) {
    console.error(e);
    throw e;
  }
});
