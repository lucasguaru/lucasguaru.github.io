const people = {
  lia: { name: 'Lia Martins', role: 'Arquiteta de Integração', copy: 'Lia desenha os limites entre os sistemas. Desconfia tanto de complexidade prematura quanto de soluções simples que escondem acoplamento.' },
  caio: { name: 'Caio Nunes', role: 'Desenvolvedor Sênior', copy: 'Caio conhece as cicatrizes do ERP Atlas e prefere mecanismos que a equipe consiga operar às três da manhã.' },
  maya: { name: 'Maya Okafor', role: 'SRE', copy: 'Maya transforma pressentimentos em sinais observáveis. Para ela, uma arquitetura que não pode ser medida ainda não pode ser defendida.' },
  renato: { name: 'Renato Alves', role: 'Product Manager', copy: 'Renato traduz oportunidades em prazos. Ele não ignora risco técnico, mas precisa saber qual risco muda uma decisão de negócio.' }
};

const feedback = {
  manter: { title: 'Manter como está', copy: 'É uma escolha defensável. O requisito atual pede resposta imediata e a solução ainda é proporcional ao problema. O risco é entrar no piloto sem saber qual limite está se aproximando.' },
  instrumentar: { title: 'Instrumentar melhor', copy: 'Você preserva a arquitetura simples, mas compra evidência: latência por operação, saturação do ERP e correlação entre pedidos. Instrumentação não aumenta a capacidade; ela melhora a próxima decisão.' },
  desacoplar: { title: 'Desacoplar agora', copy: 'Você antecipa uma provável necessidade, mas aceita consistência eventual, novas falhas e mais operação antes de ter evidência de que o fluxo síncrono deixou de servir.' }
};

const form = document.querySelector('#decision-form');
const response = document.querySelector('.response');

function showSavedDecision(savedDecision) {
  const selected = feedback[savedDecision.choice];
  if (!selected) return;
  response.querySelector('h3').textContent = selected.title;
  response.querySelector('.response-copy').textContent = selected.copy;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const choice = new FormData(form).get('decision');
  response.querySelector('h3').textContent = feedback[choice].title;
  response.querySelector('.response-copy').textContent = feedback[choice].copy;
  form.hidden = true;
  response.hidden = false;
  response.scrollIntoView({ behavior: 'smooth', block: 'center' });
  localStorage.setItem('sinal-ruido-decision', JSON.stringify({ choice, reason: form.reason.value }));
});

response.querySelector('.revise').addEventListener('click', () => {
  response.hidden = true;
  form.hidden = false;
  form.querySelector('input:checked').focus();
});

document.querySelectorAll('[data-person]').forEach(button => button.addEventListener('click', () => {
  const person = people[button.dataset.person];
  const dialog = document.querySelector('#person-dialog');
  dialog.querySelector('.dialog-role').textContent = person.role;
  dialog.querySelector('h2').textContent = person.name;
  dialog.querySelector('.dialog-copy').textContent = person.copy;
  dialog.showModal();
}));

document.querySelector('#person-dialog .close').addEventListener('click', () => document.querySelector('#person-dialog').close());

document.querySelector('.sound').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const enabled = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(enabled));
  button.lastElementChild.textContent = `Ambiente: ${enabled ? 'on' : 'off'}`;
});

const saved = JSON.parse(localStorage.getItem('sinal-ruido-decision') || 'null');
if (saved) {
  const input = form.querySelector(`[value="${saved.choice}"]`);
  if (input) input.checked = true;
  if (saved.reason) form.reason.value = saved.reason;
  showSavedDecision(saved);
}
