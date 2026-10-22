// Gera um token do Supabase (1 h) para usuários do Identity com o papel "member"
const crypto = require('crypto');

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

function assinarJwt(payload, segredo) {
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const body = b64url(payload);
  const assinatura = crypto.createHmac('sha256', segredo).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${assinatura}`;
}

exports.handler = async (event, context) => {
  const segredo = process.env.SUPABASE_JWT_SECRET;
  if (!segredo) return { statusCode: 500, body: 'SUPABASE_JWT_SECRET não configurado' };

  // Preenchido pelo Netlify a partir do header Authorization
  const user = context.clientContext && context.clientContext.user;
  const roles = (user && user.app_metadata && user.app_metadata.roles) || [];
  if (!roles.includes('member')) return { statusCode: 401, body: 'não autorizado' };

  const agora = Math.floor(Date.now() / 1000);
  const exp = agora + 3600;

  const token = assinarJwt({
    sub: user.sub,
    role: 'authenticated',
    aud: 'authenticated',
    email: user.email,
    iat: agora,
    exp
  }, segredo);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ token, exp })
  };
};
