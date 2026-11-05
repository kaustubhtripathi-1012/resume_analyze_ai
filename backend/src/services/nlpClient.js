const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

const client = axios.create({
  baseURL: env.NLP_SERVICE_URL,
  timeout: 30000,
  headers: {
    'X-Service-Key': env.NLP_SERVICE_KEY,
    'Content-Type': 'application/json'
  }
});

async function callWithRetry(fn, retries = 2) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt <= retries) {
        logger.warn(`NLP client call failed (attempt ${attempt}/${retries + 1}): ${err.message}. Retrying...`);
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      } else {
        throw err;
      }
    }
  }
}

const nlpClient = {
  async parse(filePath, fileType) {
    return callWithRetry(async () => {
      const response = await client.post('/parse', { filePath, fileType });
      return response.data;
    });
  },

  async score(parsedProfile, rawText) {
    return callWithRetry(async () => {
      const response = await client.post('/score', { parsedProfile, rawText });
      return response.data;
    });
  },

  async match(parsedProfile, jobText, jobSkills = [], experienceLevel = 'fresher') {
    return callWithRetry(async () => {
      const response = await client.post('/match', {
        parsedProfile,
        jobText,
        jobSkills,
        experienceLevel
      });
      return response.data;
    });
  },

  async recommend(parsedProfile, jobs, topN = 10) {
    return callWithRetry(async () => {
      const response = await client.post('/recommend', {
        parsedProfile,
        jobs,
        topN
      });
      return response.data;
    });
  }
};

module.exports = nlpClient;

