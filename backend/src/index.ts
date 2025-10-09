import { Elysia, t } from 'elysia';
import { parseRSLPRules } from './parser';
import RSLPStemmer from './stemmer';
import { join } from 'path';

let stemmer: RSLPStemmer;

async function initializeStemmer() {
  try {
    const rslpFilePath = join(process.cwd(), 'assets', 'portuguese.rslp');
    const steps = await parseRSLPRules(rslpFilePath);
    stemmer = new RSLPStemmer(steps);
    console.log('RSLP Stemmer initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize stemmer:', error);
    return false;
  }
}

const initialized = await initializeStemmer();

if (!initialized) {
  console.error('Server cannot start without stemmer initialization');
  process.exit(1);
}

new Elysia()
  .get('/', () => 'RSLP Stemmer API - POST to /stem with text to stem words')    
  .post('/stem', 
    ({ body }) => {
      const { text } = body;
      
      if (!text) {
        return { error: 'Text is required' };
      }
      
      if (typeof text !== 'string') {
        return { error: 'Text must be a string' };
      }

      const words = text.split(' ');
      const stemmedWords = words.map(word => stemmer.stem(word));

      return {
          original: text,
          stemmed: stemmedWords.join(' '),
        };
    },
    {
      body: t.Object({
        text: t.String()
      })
    }
  )
  .get('/health', () => ({ status: 'ok' }))
  .listen(3000, () => {
    console.log('🚀 RSLP Stemmer API running at http://localhost:3000');
  });