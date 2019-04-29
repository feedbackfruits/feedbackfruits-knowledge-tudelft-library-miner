import { OaiPmh } from 'oai-pmh'

const url = `http://oai.tudelft.nl/ir`;

export type Observerable = {
  next,
  error,
  complete,
}

async function doThings(url) {
  const oaiPmh = new OaiPmh(url)
  const identifierIterator = oaiPmh.listRecords({
    metadataPrefix: 'oai_dc',
    // ignore_deleted: true
    // from: '2015-01-01',
    // until: '2015-01-04'
  })

  for await (const identifier of identifierIterator) {
    console.log(identifier)

    // Do some processing

    // Get PDF

    // Extract dates

    // Do some queries

    // const georgiaResource: GeorgiaResource = {
    //
    // }
    //
    // await observerable.next(mapResource(georgiaResource));
  }

  // return observerable;
}

doThings(url).catch(console.error)


export type GeorgiaResource = {
  id: string,
  url: string,
  quality: number
}

export type SchemaResource = {
  id: string,
  encoding: {
    id: string
    contentUrl: string
    encodesCreativeWork: string
  }
}

export function mapResource(resource: GeorgiaResource): SchemaResource {
  const { id, url, quality } = resource;
  return {
    id,
    encoding: {
      id: url,
      contentUrl: url,
      encodesCreativeWork: id
    }
  };
}