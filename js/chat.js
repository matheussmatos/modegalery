// Chat ao vivo dos membros: histórico, mensagens em tempo real e quem está online.
import { supabase, idDoUsuario, tokenSupabase } from '/js/supabase-client.js';

const lista = document.getElementById('chatLista');
const form = document.getElementById('chatForm');
const campo = document.getElementById('chatTexto');
const botao = document.getElementById('chatEnviar');
const status = document.getElementById('chatStatus');
const online = document.getElementById('chatOnline');

const userId = idDoUsuario();
const AVATAR_PADRAO = '/img/home-mode.png';
const perfis = new Map();      // id do membro -> { username, avatar_url }
let meuPerfil = null;
let ultimoId = 0;
let canal = null;
let tokenAtual = null;

function avisar(texto, erro) {
    status.textContent = '> ' + texto;
    status.classList.toggle('erro', !!erro);
}

async function getPerfil(id) {
    if (!perfis.has(id)) {
        const { data } = await supabase.from('profiles').select('username, avatar_url').eq('id', id).maybeSingle();
        perfis.set(id, data || { username: 'membro', avatar_url: null });
    }
    return perfis.get(id);
}

function hora(iso) {
    const d = new Date(iso);
    if (d.toDateString() === new Date().toDateString()) {
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function pertoDoFim() {
    return lista.scrollHeight - lista.scrollTop - lista.clientHeight < 80;
}

// Monta tudo com textContent: o texto do membro nunca vira HTML
function renderMensagem(m, perfil) {
    if (lista.querySelector('[data-id="' + m.id + '"]')) return;
    const rolar = pertoDoFim();
    const minha = m.user_id === userId;

    const li = document.createElement('li');
    li.className = 'chat-msg' + (minha ? ' minha' : '');
    li.dataset.id = m.id;

    const img = document.createElement('img');
    img.src = (perfil && perfil.avatar_url) || AVATAR_PADRAO;
    img.alt = '';
    img.width = img.height = 32;
    img.loading = 'lazy';

    const topo = document.createElement('div');
    topo.className = 'chat-topo';
    const nome = document.createElement('b');
    nome.textContent = (perfil && perfil.username) || 'membro';
    const quando = document.createElement('time');
    quando.dateTime = m.created_at;
    quando.textContent = hora(m.created_at);
    topo.append(nome, quando);

    if (minha) {
        const apagarBtn = document.createElement('button');
        apagarBtn.type = 'button';
        apagarBtn.className = 'chat-apagar';
        apagarBtn.title = 'apagar mensagem';
        apagarBtn.textContent = '×';
        apagarBtn.addEventListener('click', () => apagar(m.id));
        topo.append(apagarBtn);
    }

    const texto = document.createElement('p');
    texto.className = 'chat-texto';
    texto.textContent = m.content;

    const corpo = document.createElement('div');
    corpo.append(topo, texto);
    li.append(img, corpo);
    lista.append(li);

    ultimoId = Math.max(ultimoId, m.id);
    if (rolar) lista.scrollTop = lista.scrollHeight;
}

function removerMensagem(id) {
    const li = lista.querySelector('[data-id="' + id + '"]');
    if (li) li.remove();
}

// Sem nada carregado: as 50 últimas. Depois (ex.: ao reconectar): só as que chegaram nesse meio tempo
async function buscarNovas() {
    let q = supabase.from('messages').select('id, user_id, content, created_at, profiles(username, avatar_url)');
    q = ultimoId
        ? q.gt('id', ultimoId).order('id', { ascending: true }).limit(200)
        : q.order('id', { ascending: false }).limit(50);
    const { data, error } = await q;
    if (error) return avisar('falha ao carregar mensagens', true);
    (ultimoId ? data : data.reverse()).forEach((m) => {
        if (m.profiles) perfis.set(m.user_id, m.profiles);
        renderMensagem(m, m.profiles);
    });
}

async function apagar(id) {
    if (!confirm('Apagar esta mensagem?')) return;
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) return avisar('não consegui apagar a mensagem', true);
    removerMensagem(id);
}

function atualizarOnline() {
    const estado = canal.presenceState();
    const nomes = Object.values(estado).map((l) => l[0] && l[0].username).filter(Boolean);
    online.textContent = '[ ' + nomes.length + ' online ]';
    online.title = nomes.join(', ');
}

function liberarEnvio(perfil) {
    meuPerfil = { username: perfil.username, avatar_url: perfil.avatar_url };
    perfis.set(userId, meuPerfil);
    campo.disabled = botao.disabled = false;
    campo.placeholder = 'escreva uma mensagem...';
    if (canal) canal.track(meuPerfil);
}

// O token do Supabase vale 1 h; a conexão em tempo real precisa recebê-lo renovado antes de vencer
async function renovarToken() {
    try {
        const t = await tokenSupabase();
        if (t !== tokenAtual) {
            tokenAtual = t;
            await supabase.realtime.setAuth(t);
        }
    } catch (e) {
        avisar('sessão expirada. saia e entre de novo', true);
    }
}

function conectar() {
    canal = supabase.channel('chat-geral', { config: { presence: { key: userId } } })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async ({ new: m }) => {
            renderMensagem(m, await getPerfil(m.user_id));
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, ({ old }) => {
            if (old && old.id) removerMensagem(old.id);
        })
        .on('presence', { event: 'sync' }, atualizarOnline)
        .subscribe((estado) => {
            if (estado === 'SUBSCRIBED') {
                avisar(lista.children.length ? 'conectado' : 'conectado. nenhuma mensagem ainda, comece a conversa');
                if (meuPerfil) canal.track(meuPerfil);
                buscarNovas();
            } else if (estado === 'CHANNEL_ERROR' || estado === 'TIMED_OUT') {
                online.textContent = '[ reconectando ]';
                avisar('conexão instável, tentando de novo...', true);
            }
        });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = campo.value.trim();
    if (!content || !meuPerfil) return;

    botao.disabled = true;
    const { data, error } = await supabase
        .from('messages').insert({ content }).select('id, user_id, content, created_at').single();
    if (error) {
        avisar('não enviou: ' + error.message, true);
        botao.disabled = false;
        return;
    }
    campo.value = '';
    renderMensagem(data, meuPerfil);
    lista.scrollTop = lista.scrollHeight;
    avisar('conectado');
    // Anti-flood simples: 1,5 s entre mensagens
    setTimeout(() => { botao.disabled = false; campo.focus(); }, 1500);
});

// Quem cria ou edita o perfil na seção acima já pode conversar, sem recarregar
window.addEventListener('mode:perfil', (e) => liberarEnvio(e.detail));

async function iniciar() {
    if (!userId) return avisar('sessão não encontrada. saia e entre de novo', true);
    const { data } = await supabase.from('profiles').select('username, avatar_url').eq('id', userId).maybeSingle();
    if (data) liberarEnvio(data);
    await buscarNovas();
    lista.scrollTop = lista.scrollHeight;
    await renovarToken();
    conectar();
    setInterval(renovarToken, 30000);
}

iniciar();
