// Cliente Supabase da área de membros.
// O login continua no Netlify Identity: trocamos o JWT do Identity por um token
// do Supabase na Function /.netlify/functions/supabase-token.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

const SUPABASE_URL = 'https://dtbxinoyqsnwgxmvkuqd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Gd0etMN6ZCFLhGrcsP7h3Q_xmvqgLOy';
const SESSAO = 'gotrue.user';

function lerSessao() {
    try { return JSON.parse(localStorage.getItem(SESSAO) || 'null'); } catch (e) { return null; }
}

function lerPayload(jwt) {
    try { return JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch (e) { return null; }
}

// JWT do Identity válido; renova pelo refresh_token e regrava a sessão (mesmo formato do portão)
async function jwtIdentity() {
    const s = lerSessao();
    if (!s || !s.token) throw new Error('sem sessão');
    if (Date.now() < s.token.expires_at - 60000) return s.token.access_token;

    const r = await fetch('/.netlify/identity/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: s.token.refresh_token }).toString()
    });
    if (!r.ok) throw new Error('sessão expirada');
    const d = await r.json();

    s.token = {
        access_token: d.access_token,
        expires_at: Date.now() + (d.expires_in || 3600) * 1000,
        expires_in: d.expires_in || 3600,
        refresh_token: d.refresh_token || s.token.refresh_token,
        token_type: d.token_type || 'bearer'
    };
    try { localStorage.setItem(SESSAO, JSON.stringify(s)); } catch (e) {}
    document.cookie = 'nf_jwt=' + d.access_token + '; path=/; SameSite=Lax';
    return d.access_token;
}

// Token do Supabase em cache até 1 min antes de vencer; chamadas simultâneas compartilham o mesmo pedido
let cache = null;
let pendente = null;
function tokenSupabase() {
    if (cache && cache.exp - 60 > Date.now() / 1000) return Promise.resolve(cache.token);
    if (!pendente) {
        pendente = (async () => {
            const r = await fetch('/.netlify/functions/supabase-token', {
                headers: { Authorization: 'Bearer ' + await jwtIdentity() }
            });
            if (!r.ok) throw new Error('sem acesso ao Supabase (' + r.status + ')');
            cache = await r.json();
            return cache.token;
        })().finally(() => { pendente = null; });
    }
    return pendente;
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { accessToken: tokenSupabase });

export function idDoUsuario() {
    const s = lerSessao();
    const p = s && s.token && lerPayload(s.token.access_token);
    return p && p.sub;
}

export { tokenSupabase };

// Atalho para testes no Console
window.mode = { supabase, idDoUsuario, tokenSupabase };
