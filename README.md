# ⌨️ DigiMaster v2.0 — By Evolua+ Profissões

Sistema completo de treinamento de digitação com Firebase, ranking, painel do professor e certificado PDF.

## 🚀 Funcionalidades v2.0

- ✅ Login com Google e e-mail/senha via Firebase
- ✅ Progresso sincronizado na nuvem (Firestore)
- ✅ **Painel do Professor** — veja progresso de todos os alunos
- ✅ **Ranking da Turma** — competição por WPM, precisão e sessões
- ✅ **Certificado PDF** gerado automaticamente (A4 paisagem)
- ✅ **Sons e feedback sonoro** — tecla correta, erro, conclusão, alerta
- ✅ **Modal de posição das mãos** pós-login com imagem real
- ✅ **Glossário de siglas** (WPM, ACC, XP, Home Row)
- ✅ 4 níveis: Básico, Intermediário, Avançado, Números
- ✅ Teclado virtual interativo e móvel

## 📁 Estrutura

```
digimaster/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── data.js          # Textos e banco de exercícios
│   ├── lessons.js       # Sistema de lições progressivas
│   ├── keyboard.js      # Teclado virtual
│   ├── stats.js         # Estatísticas e gráficos
│   ├── sounds.js        # ✨ NOVO: Sons e feedback sonoro
│   ├── certificate.js   # ✨ NOVO: Gerador de certificado PDF
│   ├── ranking.js       # ✨ NOVO: Ranking + Painel do professor
│   ├── app.js           # Lógica principal
│   └── firebase.js      # Auth + Firestore
├── assets/
│   ├── logo.png
│   └── hand-position.png  # ✨ NOVO: Foto posição das mãos
├── firestore.rules
└── README.md
```

## ⚙️ Configuração do Admin (Painel do Professor)

No arquivo `js/firebase.js`, localize a linha:
```javascript
const ADMIN_UIDS = ['COLOQUE_SEU_UID_AQUI'];
```

Substitua pelo seu UID do Firebase:
1. Faça login no site
2. Abra o console do navegador (F12)
3. Digite: `firebase.auth().currentUser.uid`
4. Cole o UID no array acima

Ou use o e-mail da escola como alternativa:
```javascript
const isAdmin = ADMIN_UIDS.includes(user.uid) || user.email?.endsWith('@suaescola.com.br');
```

## 🌐 Hospedagem GitHub Pages

1. Crie repositório no GitHub (ex: `digimaster`)
2. Faça upload de todos os arquivos
3. Settings → Pages → branch `main` → pasta `/ (root)`
4. Aguarde ~2min → `https://seu-usuario.github.io/digimaster`

## 🔐 Firebase — Configurações necessárias

### Regras do Firestore
Cole o conteúdo de `firestore.rules` no Console Firebase → Firestore → Regras

### Domínio autorizado
Firebase Console → Authentication → Settings → Domínios autorizados:
- Adicionar: `seu-usuario.github.io`

### Provedores de login
Firebase Console → Authentication → Sign-in method:
- ✅ Google
- ✅ E-mail/Senha
