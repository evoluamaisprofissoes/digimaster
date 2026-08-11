# DigiMaster 2.1 — arquivos para subir no GitHub

Este pacote contém todos os arquivos que precisam ser SUBSTITUÍDOS para aplicar esta atualização sobre o repositório atual.

## Estrutura

```text
/
├── index.html
├── firestore.rules
├── ADMIN_SETUP.md
└── js/
    └── firebase.js
```

## No GitHub

1. Substitua o arquivo `/index.html` pelo `index.html` deste pacote.
2. Abra a pasta `/js` e substitua `/js/firebase.js`.
3. Substitua `/firestore.rules` na raiz.
4. `ADMIN_SETUP.md` pode ser enviado para a raiz como documentação.
5. NÃO exclua os outros arquivos/pastas já existentes no repositório, especialmente:
   - `css/`
   - `assets/`
   - `js/data.js`
   - `js/lessons.js`
   - `js/keyboard.js`
   - `js/stats.js`
   - `js/sounds.js`
   - `js/certificate.js`
   - `js/ranking.js`
   - `js/app.js`

A atualização foi construída para complementar esses arquivos existentes.

## Depois do GitHub

As regras do Firestore precisam ser publicadas também no Firebase Console. O arquivo `ADMIN_SETUP.md` explica como ativar a conta administrativa.
