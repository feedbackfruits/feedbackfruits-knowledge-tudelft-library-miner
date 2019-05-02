import * as Config from './config';
import { mine } from './miner';

import { Miner, Config as _Config } from 'feedbackfruits-knowledge-engine';

export default async function init({ name }) {
  const send = await Miner({
    name,
    customConfig: Config as typeof _Config.Base
  });

  console.log('Starting TUDelft Library miner...');
  const docs = mine();

  let count = 0;
  await new Promise((resolve, reject) => {
    docs.subscribe({
      next: async (doc) => {
        count++;
        console.log(`Sending doc number ${count}:`, doc['@id']);
        const result = await send({ action: 'write', key: doc['@id'], data: doc });
        return result;
      },
      error: (reason) => {
        console.log('Miner crashed...');
        console.error(reason);
        reject(reason);
      },
      complete: () => {
        console.log('Miner completed');
        resolve();
      }
    });
  });

  console.log(`Mined ${count} docs from TUDelft Library`);
  return;
}

// Start the server when executed directly
declare const require: any;
if (require.main === module) {
  console.log("Running as script.");
  init({
    name: Config.NAME,
  }).catch(console.error);
}
