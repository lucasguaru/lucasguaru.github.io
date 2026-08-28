import { foundationQuestions } from './questions/foundations.js';
import { certificateQuestions } from './questions/certificates.js';
import { trustAndFormatQuestions } from './questions/trust-formats.js';
import { storeQuestions } from './questions/stores.js';
import { tlsQuestions } from './questions/tls-mtls.js';
import { mulesoftQuestions } from './questions/mulesoft.js';

const modules = [
  ['keys', 'Chave pública e privada'], ['csr', 'CSR e emissão de certificados'],
  ['ca', 'CA, Root CA e Intermediate CA'], ['chain', 'Certificate Chain e Trust'],
  ['formats', 'X.509, CRT/CER, PEM e DER'], ['stores', 'Keystore, Truststore, aliases e entries'],
  ['containers', 'JKS e PKCS#12'], ['mtls', 'TLS e mTLS'],
  ['tls13', 'TLS 1.3, ECDHE e session keys'], ['mulesoft', 'MuleSoft: Listener, Request e Private Space']
].map(([id, title], index) => ({ id, title, index: index + 1 }));

export default {
  id: 'tls',
  title: 'Certificados, TLS e mTLS',
  description: 'Domine identidade, confiança, containers e handshakes por meio de prática deliberada.',
  modules,
  questions: [...foundationQuestions, ...certificateQuestions, ...trustAndFormatQuestions, ...storeQuestions, ...tlsQuestions, ...mulesoftQuestions]
};
