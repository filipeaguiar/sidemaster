const http = require('node:http');
const dns = require('node:dns');
const net = require('node:net');

const HOSTS = ['localhost', '127.0.0.1'];
const PORT = 11434;
const validLoopback = address => net.isIP(address) === 4
  ? address.startsWith('127.')
  : address === '::1' || address.toLowerCase().startsWith('::ffff:127.');
const isRemoteModel = (name, model = {}) => Boolean(model.remote_host || model.remote_model || /:cloud(?:$|[-/])/i.test(String(name || '')));

function request(path, { method = 'GET', body, timeout = 3000, signal } = {}) {
  if (!['/api/tags', '/api/show', '/api/generate'].includes(path)) return Promise.reject(new Error('Endpoint Ollama inválido'));
  const payload = body === undefined ? undefined : Buffer.from(JSON.stringify(body));
  const attempt = (host) => new Promise((resolve, reject) => {
    const req = http.request({
      hostname: host, port: PORT, path, method,
      headers: payload ? { 'content-type': 'application/json', 'content-length': payload.length } : {},
      agent: false,
      lookup(hostname, options, callback) {
        dns.lookup(hostname, { ...options, all: true }, (error, addresses) => {
          if (error) return callback(error);
          const safe = addresses.filter(entry => validLoopback(entry.address));
          if (!safe.length) return callback(new Error('Ollama não resolveu para um endereço local'));
          if (options?.all) callback(null, safe);
          else callback(null, safe[0].address, safe[0].family);
        });
      },
    }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400) { response.resume(); reject(new Error('Redirecionamento Ollama bloqueado')); return; }
      const chunks = []; let size = 0;
      response.on('data', chunk => { size += chunk.length; if (size > 2 * 1024 * 1024) req.destroy(new Error('Resposta Ollama excede 2 MiB')); else chunks.push(chunk); });
      response.on('end', () => {
        clearTimeout(timer);
        const raw = Buffer.concat(chunks).toString('utf8');
        if (response.statusCode < 200 || response.statusCode >= 300) return reject(new Error(`Ollama respondeu HTTP ${response.statusCode}: ${raw.slice(0, 400)}`));
        try { resolve(JSON.parse(raw)); } catch { reject(new Error('Ollama respondeu conteúdo JSON inválido')); }
      });
    });
    const timer = setTimeout(() => req.destroy(Object.assign(new Error('Tempo limite do Ollama excedido'), { code: 'ETIMEDOUT' })), timeout);
    timer.unref?.();
    req.on('error', error => { clearTimeout(timer); reject(error); });
    if (signal) {
      if (signal.aborted) req.destroy(Object.assign(new Error('Operação cancelada'), { name: 'AbortError' }));
      else signal.addEventListener('abort', () => req.destroy(Object.assign(new Error('Operação cancelada'), { name: 'AbortError' })), { once: true });
    }
    if (payload) req.write(payload);
    req.end();
  });
  return attempt(HOSTS[0]).catch(error => {
    if (HOSTS[0] !== HOSTS[1] && ['ENOTFOUND', 'ECONNREFUSED', 'EAI_AGAIN'].includes(error.code)) return attempt(HOSTS[1]);
    throw error;
  });
}

async function discover() {
  const result = await request('/api/tags', { timeout: 3000 });
  if (!result || !Array.isArray(result.models)) throw new Error('Resposta incompatível com a API de catálogo do Ollama');
  return result.models.map(model => ({
    name: String(model.name || model.model || ''), size: Number(model.size) || 0,
    digest: String(model.digest || ''), details: model.details || {},
    remote: isRemoteModel(model.name || model.model, model),
  })).filter(model => model.name);
}

async function inspect(name) {
  // Verbose expands the full tokenizer vocabulary; generation readiness needs metadata only.
  const data = await request('/api/show', { method: 'POST', timeout: 5000, body: { model: name, verbose: false } });
  const remote = isRemoteModel(name, data || {});
  const info = data?.model_info || {};
  const architecture = typeof info['general.architecture'] === 'string';
  const parameters = info['general.parameter_count'] || info['general.file_type'];
  const capabilities = Array.isArray(data?.capabilities) ? data.capabilities : [];
  return { name, remote, compatible: !remote && architecture && Boolean(parameters), capabilities, details: data?.details || {}, digest: data?.digest || '' };
}

async function generate({ model, prompt, system, timeout = 180000, signal }) {
  if (typeof model !== 'string' || model.length > 256 || typeof prompt !== 'string' || !prompt.trim() || Buffer.byteLength(prompt) > 16000 || typeof system !== 'string' || system.length > 6000) throw new Error('Pedido de tradução inválido');
  const result = await request('/api/generate', { method: 'POST', timeout, signal, body: { model, prompt, system, stream: false, think: false } });
  if (isRemoteModel(result?.model || model, result || {})) throw new Error('O modelo informou execução remota; resultado descartado');
  if (typeof result?.response !== 'string' || !result.response.trim() || result.done !== true) throw new Error('Ollama não retornou um texto completo');
  return { response: result.response, doneReason: result.done_reason || '', model: result.model || model };
}

module.exports = { request, discover, inspect, generate, validLoopback };
