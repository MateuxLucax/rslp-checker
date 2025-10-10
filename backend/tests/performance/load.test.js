import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const stemTrend = new Trend('stem_duration', true);

export const options = {
  stages: [
    { duration: '15s', target: 20 },
    { duration: '30s', target: 100 },
    { duration: '15s', target: 20 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const testTexts = [
  'casa casas casinha casarão',
  'trabalho trabalhador trabalhando trabalhos',
  'estudar estudo estudante estudando estudos',
  'desenvolvimento desenvolvedor desenvolvendo desenvolve',
  'aplicação aplicações aplicar aplicando aplicado',
  'sistema sistemas sistemático sistematicamente',
  'programa programação programador programando',
  'computação computador computacional computando',
  'tecnologia tecnológico tecnologias tecnólogo',
  'inovação inovador inovando inovações inovativo',
  'empresa empresarial empresário empresas',
  'mercado mercados mercadoria mercadológico',
  'produto produtos produção produzir produtivo',
  'serviço serviços servir servindo servidor',
  'cliente clientes clientela',
  'venda vendas vender vendedor vendendo',
  'compra compras comprar comprador comprando',
  'negócio negócios negociar negociação negociante',
  'gestão gestor gestores gerenciar gerenciamento',
  'administração administrativo administrador administrar',
];

function getRandomText() {
  return testTexts[Math.floor(Math.random() * testTexts.length)];
}

export function setup() {
  console.log('Starting RSLP Stemmer Load Test');
  console.log(`Base URL: ${BASE_URL}`);

  const healthResponse = http.get(`${BASE_URL}/health`);
  if (healthResponse.status !== 200) {
    throw new Error(`Health check failed: ${healthResponse.status}`);
  }

  console.log('Health check passed');
  return { baseUrl: BASE_URL };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const text = getRandomText();
  const payload = JSON.stringify({ text });

  const response = http.post(`${data.baseUrl}/stem`, payload, { headers });

  stemTrend.add(response.timings.duration);

  const isSuccess = check(response, {
    'status is 200': (r) => r.status === 200,
    'response has original text': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.original === text;
      } catch (e) {
        return false;
      }
    },
    'response has stemmed text': (r) => {
      try {
        const body = JSON.parse(r.body);
        return typeof body.stemmed === 'string' && body.stemmed.length > 0;
      } catch (e) {
        return false;
      }
    },
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(!isSuccess);
}

export function teardown(data) {
  console.log('Load test completed');

  const healthResponse = http.get(`${data.baseUrl}/health`);
  if (healthResponse.status === 200) {
    console.log('Final health check passed');
  } else {
    console.log(`Final health check failed: ${healthResponse.status}`);
  }
}
