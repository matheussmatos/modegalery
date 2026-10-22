// Perfil do membro: carrega, troca a foto (recortada em 256×256) e salva no Supabase.
import { supabase, idDoUsuario } from '/js/supabase-client.js';

const form = document.getElementById('perfilForm');
const campoUser = document.getElementById('perfilUsername');
const campoBio = document.getElementById('perfilBio');
const campoFoto = document.getElementById('perfilFoto');
const preview = document.getElementById('perfilPreview');
const status = document.getElementById('perfilStatus');
const botao = document.getElementById('perfilSalvar');

const userId = idDoUsuario();
let avatarUrl = null;
let fotoNova = null;

function avisar(texto, erro) {
    status.textContent = '> ' + texto;
    status.classList.toggle('erro', !!erro);
}

async function carregar() {
    if (!userId) return avisar('sessão não encontrada. saia e entre de novo', true);
    const { data, error } = await supabase
        .from('profiles').select('username, bio, avatar_url').eq('id', userId).maybeSingle();
    if (error) return avisar('falha ao carregar o perfil', true);
    if (!data) return avisar('perfil ainda não criado. escolha um nome de usuário');
    campoUser.value = data.username;
    campoBio.value = data.bio || '';
    avatarUrl = data.avatar_url;
    if (avatarUrl) preview.src = avatarUrl;
    avisar('perfil carregado');
}

// Recorta o centro em quadrado e reduz; webp quando o navegador suporta, senão jpeg
async function reduzirImagem(file, lado) {
    const img = await createImageBitmap(file);
    const corte = Math.min(img.width, img.height);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = lado;
    canvas.getContext('2d').drawImage(
        img, (img.width - corte) / 2, (img.height - corte) / 2, corte, corte, 0, 0, lado, lado
    );
    const webp = await new Promise((ok) => canvas.toBlob(ok, 'image/webp', 0.85));
    if (webp && webp.type === 'image/webp') return webp;
    return new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', 0.85));
}

campoFoto.addEventListener('change', async () => {
    const file = campoFoto.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return avisar('escolha uma imagem', true);
    try {
        fotoNova = await reduzirImagem(file, 256);
        preview.src = URL.createObjectURL(fotoNova);
        avisar('foto pronta. clique em salvar');
    } catch (e) {
        avisar('não consegui ler essa imagem', true);
    }
});

// Só minúsculas, números e _ (mesma regra do banco)
campoUser.addEventListener('input', () => {
    campoUser.value = campoUser.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = campoUser.value.trim();
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
        return avisar('nome: 3 a 20 caracteres, só a-z, 0-9 e _', true);
    }

    botao.disabled = true;
    avisar('salvando...');
    try {
        if (fotoNova) {
            const caminho = userId + '/avatar';
            const { error } = await supabase.storage.from('avatars')
                .upload(caminho, fotoNova, { upsert: true, contentType: fotoNova.type });
            if (error) throw error;
            // ?v= força o navegador a buscar a foto nova em vez da antiga do cache
            avatarUrl = supabase.storage.from('avatars').getPublicUrl(caminho).data.publicUrl + '?v=' + Date.now();
            fotoNova = null;
        }

        const { error } = await supabase.from('profiles').upsert({
            id: userId,
            username,
            bio: campoBio.value.trim() || null,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;

        avisar('perfil salvo');
        // Avisa o resto da página (o chat do Passo 6 vai usar)
        window.dispatchEvent(new CustomEvent('mode:perfil', { detail: { username, avatar_url: avatarUrl } }));
    } catch (err) {
        avisar(err.code === '23505' ? 'esse nome de usuário já está em uso' : 'erro ao salvar: ' + (err.message || err), true);
    } finally {
        botao.disabled = false;
    }
});

carregar();
