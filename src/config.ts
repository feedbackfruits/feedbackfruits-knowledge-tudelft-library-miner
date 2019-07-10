require('dotenv').config();

const {
  NAME = 'feedbackfruits-knowledge-tudelft-library-miner',
  KAFKA_ADDRESS = 'tcp://localhost:9092',
  OUTPUT_TOPIC = 'staging_mit_update_requests',

} = process.env;

const CONCURRENCY = parseInt(process.env.CONCURRENCY) || 1;

export {
  NAME,
  KAFKA_ADDRESS,
  OUTPUT_TOPIC,
  CONCURRENCY
};
