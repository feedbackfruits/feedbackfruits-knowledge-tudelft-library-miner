import test from 'ava';

import memux from 'memux';
import init from '../dist';
import { NAME, KAFKA_ADDRESS, OUTPUT_TOPIC } from '../dist/config';

test('it exists', t => {
  t.not(init, undefined);
});

// TODO: @Georgia: Expand this as needed to test data that is sent over the bus contains all the required properties
const Resource = {
  "@id": "https://repository.tudelft.nl/islandora/object/uuid:000045fb-4762-4985-a423-688824607d8c/datastream/OBJ/download",
  "@type": [
    "Resource",
    "Document"
  ],
  "author": [
    "Jarquin-Laguna, A."
  ],
  "dateCreated": "2014-03-31T00:00:00.000Z",
  "description": "An innovative and completely different wind-energy conversion system is studied where a centralized electricity generation within a wind farm is proposed by means of a hydraulic network. This paper presents the dynamic interaction of two turbines when they are coupled to the same hydraulic network. Due to the stochastic nature of the wind and wake interaction effects between turbines, the operating parameters (i.e. pitch angle, rotor speed) of each turbine are different. Time domain simulations, including the main turbine dynamics and laminar transient flow in pipelines, are used to evaluate the efficiency and rotor speed stability of the hydraulic system. It is shown that a passive control of the rotor speed, as proposed in previous work for a single hydraulic turbine, has strong limitations in terms of performance for more than one turbine coupled to the same hydraulic network. It is concluded that in order to connect several turbines, a passive control strategy of the rotor speed is not sufficient and a hydraulic network with constant pressure is suggested. However, a constant pressure network requires the addition of active control at the hydraulic motors and spear valves, increasing the complexity of the initial concept. Further work needs to be done to incorporate an active control strategy and evaluate the feasibility of the constant pressure hydraulic network.,Hydraulic Engineering,Civil Engineering and Geosciences",
  "inLanguage": "en",
  "learningResourceType": "journal article",
  "license": [
    "C"
  ],
  "name": "Fluid power network for centralized electricity generation in offshore wind farms",
  "sourceOrganization": [
    "http://repository.tudelft.nl"
  ],
  "topic": [
    "http://resolver.tudelft.nl/uuid:000045fb-4762-4985-a423-688824607d8c"
  ]
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
