// =========================================
// DigiMaster - Sistema de Lições v3.0
// Conclusão por nível + critério de precisão
// =========================================

const MIN_LESSON_ACCURACY = 80;

const LESSONS = {
  basico: {
    title: '🌱 Nível Básico',
    shortTitle: 'Básico',
    desc: 'Aprenda a posicionar os dedos e comece com as teclas fundamentais. Cada lição foca em grupos específicos de teclas.',
    color: 'var(--rgb-4)',
    lessons: [
      { id:'b0', num:0, icon:'🏠', title:'Introdução - Posição Home', desc:'Antes de tudo: conheça a posição base. Dedos da mão esquerda em ASDF e direita em JKL. Esta é a fundação de tudo.', keys:['a','s','d','f','j','k','l'], homeKeys:['a','s','d','f','j','k','l'], text:'aaa sss ddd fff jjj kkk lll aaa jjj sss kkk ddd lll fff jjj asdf jkl fdsa lkj asdf jkl', xp:30, tip:'Sinta as marcas nas teclas F e J sem olhar. Elas são seu ponto de referência sempre.', isIntro:true },

      { id:'b1', num:1, icon:'✋', title:'Mão Esquerda - ASDF', desc:'Dedinho em A, anelar em S, médio em D, indicador em F. Pratique só a mão esquerda.', keys:['a','s','d','f'], homeKeys:['a','s','d','f'], text:'aaa sss ddd fff aaa sss ddd fff asd fds sad fas daf sdf fda sfa daf fas sdf aaa fff ddd sss asdf fdsa sadf dsaf', xp:50, tip:'Mantenha os dedos relaxados sobre as teclas. O polegar fica sobre a barra de espaço.' },

      { id:'b2', num:2, icon:'🤚', title:'Mão Direita - JKLÇ', desc:'Indicador em J, médio em K, anelar em L, dedinho em Ç. Pratique só a mão direita.', keys:['j','k','l',';'], homeKeys:['j','k','l'], text:'jjj kkk lll jjj kkk lll jkl lkj kjl jlk lkj kjl jjj lll kkk jkl lkj jlk kjl jkl lkj kjl jkl lkj', xp:50, tip:'Sinta as marcas em F e J. Elas indicam a posição home sem precisar olhar para o teclado.' },

      { id:'b3', num:3, icon:'👐', title:'Mãos Juntas - ASDF + JKL', desc:'Agora combine as duas mãos na posição home. Pratique alternando entre elas com ritmo.', keys:['a','s','d','f','j','k','l'], homeKeys:['a','s','d','f','j','k','l'], text:'asdf jkl fads lkj sdf jkl adf jlk dsa klj fja skd lad fkj sdf jkl asdf jkl fdsa lkj asdf jkl', xp:75, tip:'Alterne as mãos de forma rítmica. Isso é a base de uma boa digitação profissional.' },

      { id:'b4', num:4, icon:'⬆️', title:'Teclas GH - Centro do Teclado', desc:'G e H ficam no centro. O indicador esquerdo alcança G saindo de F, e o direito alcança H saindo de J.', keys:['g','h'], homeKeys:['f','j'], text:'ggg hhh ghg hgh ggh hhg ghh ggh fgh jhk gah hag gfh jhk ghj hgf asg jhk dfg lkh asdfgh jklhg', xp:60, tip:'Após pressionar G ou H, retorne imediatamente os dedos para F e J.' },

      { id:'b5', num:5, icon:'⬆️', title:'Fileira Superior - QWE / UIO', desc:'Mova os dedos para cima a partir da posição home. Retorne sempre após cada tecla.', keys:['q','w','e','u','i','o'], homeKeys:['a','s','d','j','k','l'], text:'que owi woe ieu qui oew uio qwe owe uiq oiq eqo iuw qoi euw oiw eqw iou wue qio quei ouiw', xp:80, tip:'Após pressionar uma tecla superior, retorne imediatamente à posição home.' },

      { id:'b6', num:6, icon:'⬆️', title:'Fileira Superior - RT / YU', desc:'R e T são alcançados pelo indicador esquerdo. Y e U pelo indicador direito.', keys:['r','t','y','u'], homeKeys:['f','j'], text:'rrt tty yyu urt try yur rty uyt ryu tyr yut rtu ytr uyr tyr ryu tuy ryt yur tru erty yuio', xp:80, tip:'Estique o indicador para cima sem mover o pulso. Retorne à posição home após cada tecla.' },

      { id:'b7', num:7, icon:'⬇️', title:'Fileira Inferior - ZXCV / NM', desc:'Flexione os dedos para baixo a partir da posição home. Z usa o dedinho esquerdo.', keys:['z','x','c','v','n','m'], homeKeys:['a','s','d','f','j','k'], text:'zzz xxx ccc vvv nnn mmm znm vxc cxz nmv vcx mnz xzc vnm cxz vmn zxc nmv cxz mnv zxcv nm', xp:80, tip:'Não levante os pulsos ao acessar a fileira inferior. Flexione apenas os dedos.' },

      { id:'b8', num:8, icon:'📝', title:'Palavras Básicas I', desc:'Pratique as primeiras palavras reais usando todas as letras aprendidas.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'sol lua mar rio voz mao dia cor luz noz asa mel fel cal mal sal ala ela ola ali ame amo ave', xp:100, tip:'Foque em precisão, não em velocidade. A velocidade vem naturalmente com a prática.' },

      { id:'b9', num:9, icon:'📝', title:'Palavras Básicas II', desc:'Mais palavras comuns para consolidar o aprendizado das teclas básicas.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'casa sala mesa vela faca cola mala bola cama roda moda soda toda boca loca foca roca poda', xp:100, tip:'Tente manter um ritmo constante. Pausas longas entre teclas atrapalham a fluência.' },

      { id:'b10', num:10, icon:'🏆', title:'Desafio Básico', desc:'Teste do conteúdo básico aprendido até aqui.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'asdf jkl casa sala mesa faca bola vela mala roda soda cola moda dia sol lua mar rio voz cor luz', xp:150, tip:'Mantenha os dedos na posição home e priorize a precisão.', isChallenge:true },

      { id:'b11', num:11, icon:'🔁', title:'Consolidação de Teclas', desc:'Reforce todas as fileiras com sequências variadas.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'asdf jkl qwer uiop zxcv nm casa mesa sala porta janela livro tecla mouse tela curso aluno pratica ritmo foco', xp:120, tip:'Volte sempre para a posição home.' },

      { id:'b12', num:12, icon:'🧩', title:'Palavras do Cotidiano', desc:'Treine palavras comuns e memória muscular.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'casa escola trabalho amigo familia mercado cidade rua bairro telefone mensagem arquivo pasta agenda tarefa cliente produto', xp:120, tip:'Leia a próxima palavra enquanto termina a atual.' },

      { id:'b13', num:13, icon:'💼', title:'Vocabulário de Trabalho', desc:'Palavras usadas em atendimento e administração.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'nome cadastro cliente pedido valor prazo caixa venda compra estoque conta ficha nota curso aula prova equipe meta', xp:130, tip:'Priorize precisão nos registros.' },

      { id:'b14', num:14, icon:'✍️', title:'Frases Curtas', desc:'Passe de palavras isoladas para frases completas.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'O aluno pratica todos os dias. A escola prepara para o trabalho. O cliente precisa de uma resposta clara. O arquivo deve ser salvo na pasta correta.', xp:140, tip:'Mantenha ritmo constante.' },

      { id:'b15', num:15, icon:'🏁', title:'Desafio de Fluência Básica', desc:'Texto maior para consolidar definitivamente o nível básico.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Digitar bem exige pratica e paciencia. No inicio o aluno deve pensar mais na precisao do que na velocidade. Com treino frequente os dedos aprendem o caminho das teclas e o texto passa a fluir com mais naturalidade.', xp:220, tip:'Evite olhar para o teclado.', isChallenge:true }
    ]
  },


  intermediario: {
    title: '⚡ Nível Intermediário',
    shortTitle:'Intermediário',
    desc: 'Desenvolva velocidade e ritmo com palavras e frases completas. Foco em textos naturais.',
    color:'var(--rgb-5)',

    lessons: [

      { id:'i1', num:1, icon:'⌨️', title:'Uso do Shift - Maiúsculas', desc:'Use o Shift com a mão oposta. Para letras da mão direita, use Shift esquerdo e vice-versa.', keys:['A','S','D','F','J','K','L'], homeKeys:['a','s','d','f','j','k','l'], text:'Ana Sol Lua Mar Rio Dia Cor Luz Asa Mel Sal Ala Ela Ola Ali Ame Jose Maria Pedro Carlos Silva', xp:80, tip:'Mantenha o Shift pressionado enquanto digita a letra maiúscula, depois solte ambas.' },

      { id:'i2', num:2, icon:'🔤', title:'Vogais com Acento', desc:'Pratique as vogais acentuadas comuns no português.', keys:['á','é','í','ó','ú','ã','õ'], homeKeys:['a','s','d','f','j','k','l'], text:'acao nacao funcao atencao condicao missao botoes maos pao nao sao cao mao vao rao tao sao', xp:90, tip:'No teclado ABNT, os acentos ficam próximos às teclas da mão direita.' },

      { id:'i3', num:3, icon:'📱', title:'Palavras de Tecnologia', desc:'Termos técnicos de informática usados no dia a dia profissional.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'mouse teclado monitor arquivo pasta login senha email backup sistema disco rede dados nuvem', xp:100, tip:'Fique confortável com termos técnicos e palavras em inglês.' },

      { id:'i4', num:4, icon:'🔢', title:'Pontuação Básica', desc:'Ponto, vírgula, dois-pontos e ponto-e-vírgula.', keys:['.',',',':',';'], homeKeys:['a','s','d','f','j','k','l'], text:'Ola mundo. Como vai? Tudo bem. Nome: Maria. Data: hoje. Lista: um dois tres quatro cinco.', xp:90, tip:'Não mude a posição da mão ao acessar pontuação.' },

      { id:'i5', num:5, icon:'📝', title:'Frases Completas I', desc:'Pratique com frases reais do cotidiano profissional.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'O computador e uma ferramenta essencial no trabalho moderno. Salve seus arquivos regularmente.', xp:110, tip:'Leia a próxima palavra antes de terminar a atual.' },

      { id:'i6', num:6, icon:'📝', title:'Frases Completas II', desc:'Continue praticando com frases mais longas e complexas.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A internet conecta pessoas de todo o mundo. Aprenda a digitar bem para ser mais produtivo.', xp:110, tip:'Se errar, continue digitando e mantenha o ritmo.' },

      { id:'i7', num:7, icon:'💼', title:'Vocabulário Profissional', desc:'Palavras e expressões usadas no ambiente de trabalho.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'relatorio reuniao proposta cliente contrato prazo orcamento projeto equipe resultado analise', xp:110, tip:'Pratique palavras longas separadamente.' },

      { id:'i8', num:8, icon:'🏆', title:'Desafio Intermediário', desc:'Parágrafo completo sobre tecnologia.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A tecnologia transformou o mercado de trabalho. Saber digitar com velocidade e precisao e um diferencial. Pratique diariamente e evolua suas habilidades profissionais.', xp:200, tip:'Foque na precisão primeiro.', isChallenge:true },

      { id:'i9', num:9, icon:'📧', title:'E-mails Profissionais', desc:'Pratique mensagens de trabalho.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Bom dia. Segue em anexo o relatório solicitado. Por favor confirme o recebimento e informe se precisar de algum ajuste. Ficamos à disposição para esclarecer dúvidas e dar continuidade ao atendimento.', xp:150, tip:'Cuide da pontuação e acentuação.' },

      { id:'i10', num:10, icon:'📊', title:'Rotina Administrativa', desc:'Documentos, prazos e organização.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A rotina administrativa exige organização de documentos, atualização de cadastros, controle de prazos, comunicação com clientes e registro correto das informações nos sistemas da empresa.', xp:160, tip:'Mantenha velocidade constante.' },

      { id:'i11', num:11, icon:'🛒', title:'Atendimento e Vendas', desc:'Situações comuns de contato com clientes.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Um bom atendimento começa com atenção. Registre o nome do cliente, confirme os dados, entenda a necessidade e apresente a solução com clareza. Antes de finalizar, revise valores, prazos e formas de pagamento.', xp:160, tip:'Precisão vale mais do que pressa.' },

      { id:'i12', num:12, icon:'🗂️', title:'Organização Digital', desc:'Fluência com um texto mais longo.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Arquivos bem organizados economizam tempo. Use nomes claros, separe documentos por assunto e mantenha cópias de segurança dos materiais importantes. Uma estrutura simples de pastas facilita o trabalho individual e a colaboração com toda a equipe.', xp:170, tip:'Leia algumas palavras à frente.' },

      { id:'i13', num:13, icon:'🏁', title:'Desafio Intermediário II', desc:'Ritmo, precisão e produtividade.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Profissionais que digitam com agilidade conseguem registrar informações, responder mensagens e trabalhar em sistemas com menos esforço. A velocidade é útil, mas deve caminhar junto com a precisão. Um dado digitado de forma errada pode gerar retrabalho e atrasos.', xp:260, tip:'Busque precisão e ritmo constante.', isChallenge:true }

    ]
  },


  avancado: {

    title:'🔥 Nível Avançado',
    shortTitle:'Avançado',

    desc:'Textos longos sobre tecnologia, informática e inovação. Meta: alta velocidade com precisão.',

    color:'var(--rgb-1)',

    lessons:[

      { id:'a1', num:1, icon:'🚀', title:'Velocidade com Precisão', desc:'Textos fluidos sobre tecnologia para desenvolver ritmo e consistência.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A inteligencia artificial esta revolucionando diversos setores da economia global desde saude ate educacao e logistica.', xp:150, tip:'Em textos longos, mantenha o ritmo constante.' },

      { id:'a2', num:2, icon:'💻', title:'Linguagens de Programação', desc:'Termos e palavras-chave usados em programação.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Python JavaScript HTML CSS SQL Java function class return import export const let var if else while for', xp:160, tip:'Uma boa velocidade de digitação acelera o desenvolvimento.' },

      { id:'a3', num:3, icon:'🌐', title:'Texto Técnico - Redes', desc:'Vocabulário e conceitos de redes de computadores e internet.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Redes de computadores permitem o compartilhamento de recursos e informacoes entre dispositivos conectados por meio de protocolos de comunicacao padronizados.', xp:170, tip:'Quanto mais você pratica, mais familiar fica o vocabulário.' },

      { id:'a4', num:4, icon:'🔒', title:'Texto Técnico - Segurança', desc:'Termos e conceitos de segurança da informação.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A seguranca da informacao protege dados contra acessos nao autorizados. Senhas fortes e autenticacao em dois fatores sao praticas essenciais para qualquer profissional.', xp:170, tip:'Palavras compostas precisam de atenção especial.' },

      { id:'a5', num:5, icon:'🤖', title:'Inteligência Artificial', desc:'Parágrafo sobre IA e aprendizado de máquina.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'O aprendizado de maquina permite que sistemas computacionais aprendam padroes a partir de dados sem serem explicitamente programados para cada tarefa especifica.', xp:180, tip:'Anote palavras técnicas em que costuma errar.' },

      { id:'a6', num:6, icon:'🏆', title:'Desafio Avançado', desc:'Texto longo e fluido para testar consistência.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A transformacao digital esta redefinindo a forma como empresas operam e se relacionam com clientes. Profissionais que dominam ferramentas tecnologicas e digitam com agilidade possuem vantagem competitiva significativa no mercado de trabalho atual.', xp:300, tip:'Mantenha o ritmo e confie no seu treinamento.', isChallenge:true },

      { id:'a7', num:7, icon:'📈', title:'Indicadores e Decisão', desc:'Análise e gestão empresarial.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Indicadores de desempenho ajudam empresas a acompanhar resultados e identificar oportunidades de melhoria. Dados de vendas, produtividade, satisfação e custos precisam ser registrados com consistência para que gestores possam comparar períodos e tomar decisões melhores.', xp:200, tip:'Evite acelerar em termos técnicos.' },

      { id:'a8', num:8, icon:'☁️', title:'Computação em Nuvem', desc:'Texto técnico longo e fluido.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A computação em nuvem permite acessar sistemas, arquivos e serviços pela internet sem depender de um único computador físico. Empresas utilizam essa estrutura para ampliar disponibilidade, facilitar colaboração e ajustar recursos conforme a demanda.', xp:210, tip:'Mantenha cadência estável.' },

      { id:'a9', num:9, icon:'🛡️', title:'Cultura de Cibersegurança', desc:'Comportamento e proteção de dados.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A segurança da informação depende de ferramentas e também do comportamento das pessoas. Senhas fortes, autenticação em dois fatores, atualizações frequentes e atenção a mensagens suspeitas reduzem riscos. Treinamento contínuo transforma cada colaborador em parte da proteção digital.', xp:220, tip:'Observe acentos e pontuação.' },

      { id:'a10', num:10, icon:'🤖', title:'IA no Trabalho', desc:'Uso responsável de inteligência artificial.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A inteligência artificial pode resumir documentos, apoiar análises, automatizar tarefas repetitivas e acelerar a criação de conteúdo. O profissional continua responsável por revisar resultados, proteger informações sensíveis e aplicar pensamento crítico antes de transformar uma sugestão automática em decisão.', xp:230, tip:'Mantenha precisão mesmo em alta velocidade.' },

      { id:'a11', num:11, icon:'🏁', title:'Desafio Profissional', desc:'Tecnologia, negócios e produtividade.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'A transformação digital exige mais do que novas ferramentas. Processos precisam ser revistos, pessoas precisam aprender e informações precisam circular com qualidade. Profissionais capazes de combinar domínio tecnológico, comunicação e pensamento crítico se adaptam melhor às mudanças.', xp:350, tip:'Feche o nível mantendo precisão e consistência.', isChallenge:true }

    ]
  },


  numeros: {

    title:'🔢 Números e Símbolos',
    shortTitle:'Números & Símbolos',

    desc:'Domine números e caracteres especiais essenciais para planilhas, códigos e documentos.',

    color:'var(--rgb-6)',

    lessons:[

      { id:'n1', num:1, icon:'1️⃣', title:'Números 1 a 5', desc:'Fileira numérica superior - primeira metade.', keys:['1','2','3','4','5'], homeKeys:['a','s','d','f'], text:'1 2 3 4 5 12 23 34 45 51 123 234 345 451 512 1234 2345 3451 4512 5123 11 22 33 44 55', xp:70, tip:'A mão esquerda cobre 1-5 e a direita cobre 6-0.' },

      { id:'n2', num:2, icon:'6️⃣', title:'Números 6 a 0', desc:'Fileira numérica superior - segunda metade.', keys:['6','7','8','9','0'], homeKeys:['j','k','l'], text:'6 7 8 9 0 67 78 89 90 06 678 789 890 906 067 6789 7890 8906 9067 0678 66 77 88 99 00', xp:70, tip:'Use os quatro dedos e estique para as teclas distantes.' },

      { id:'n3', num:3, icon:'🔢', title:'Todos os Números', desc:'Pratique todos os dígitos de 0 a 9 misturados.', keys:['0','1','2','3','4','5','6','7','8','9'], homeKeys:['a','s','d','f','j','k','l'], text:'1984 2023 2024 2025 1024 4096 8192 1000 9999 3141 2718 1618 7777 1234 5678 9012 3456', xp:90, tip:'Datas, anos e valores numéricos são usos comuns.' },

      { id:'n4', num:4, icon:'📊', title:'Valores Monetários', desc:'Pratique digitação de valores financeiros.', keys:['R','$','.',','], homeKeys:['a','s','d','f','j','k','l'], text:'R$ 1.500,00 R$ 299,90 R$ 4.750,00 R$ 89,99 R$ 12.000,00 R$ 450,75 R$ 3.200,50', xp:100, tip:'Em valores financeiros, precisão é crítica.' },

      { id:'n5', num:5, icon:'📞', title:'Telefones e CEPs', desc:'Formatos comuns de telefones, CEP e datas.', keys:['(',')','-','/'], homeKeys:['a','s','d','f','j','k','l'], text:'(65) 3322-1100 (11) 99999-0000 78305-000 79000-000 01/01/2025 31/12/2024 15/06/2025', xp:110, tip:'Pratique parênteses, hífens e barras sem olhar.' },

      { id:'n6', num:6, icon:'⌨️', title:'Símbolos Especiais', desc:'Caracteres usados em e-mails, documentos e programação.', keys:['@','#','%','&','*','_'], homeKeys:['a','s','d','f','j','k','l'], text:'email@dominio.com.br usuario@empresa.net #tecnologia #informatica 50% 100% user_name config_file', xp:120, tip:'O @ e o _ aparecem muito em ambientes digitais.' },

      { id:'n7', num:7, icon:'🏆', title:'Desafio Números', desc:'Mistura de números, símbolos e texto.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Pedido 1234 Cliente Joao Silva Tel (65) 99999-0000 Valor R$ 1.500,00 Venc 31/01/2025', xp:200, tip:'Este formato simula registros profissionais.', isChallenge:true },

      { id:'n8', num:8, icon:'🧾', title:'Pedidos e Notas', desc:'Códigos, quantidades e valores.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Pedido 45821 Nota 1027 Cliente 00374 Quantidade 18 Valor unitario R$ 49,90 Total R$ 898,20 Desconto 10% Valor final R$ 808,38', xp:140, tip:'Confira cada número antes de avançar.' },

      { id:'n9', num:9, icon:'📅', title:'Datas e Horários', desc:'Agenda e atendimento.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'10/08/2026 14:30 11/08/2026 08:15 17/08/2026 09:45 31/08/2026 18:00 01/09/2026 07:30 10/09/2026 16:20', xp:140, tip:'Cuide das barras e dos dois-pontos.' },

      { id:'n10', num:10, icon:'📦', title:'Controle de Estoque', desc:'Entradas, saídas e saldos.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Produto 1024 Estoque inicial 1250 Entrada 375 Saida 842 Saldo 783 Custo R$ 27,45 Valor total R$ 21.493,35 Reposicao 350 unidades', xp:150, tip:'Atenção aos separadores decimais.' },

      { id:'n11', num:11, icon:'💳', title:'Parcelas e Vencimentos', desc:'Valores e datas financeiras.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Total R$ 1.497,00 Entrada R$ 300,00 Saldo R$ 1.197,00 Parcela 1 R$ 399,00 10/09/2026 Parcela 2 R$ 399,00 10/10/2026 Parcela 3 R$ 399,00 10/11/2026', xp:160, tip:'Um caractere errado muda o valor.' },

      { id:'n12', num:12, icon:'🏁', title:'Desafio Numérico Profissional', desc:'Documentos, contatos e valores.', keys:[], homeKeys:['a','s','d','f','j','k','l'], text:'Protocolo 202608104587 Cliente 00374 Tel (65) 99999-1234 CEP 78305-000 Pedido 45821 Total R$ 2.750,50 Desconto 8% Vencimento 10/09/2026 Atendimento 14:35', xp:260, tip:'Busque precisão máxima.', isChallenge:true }

    ]
  }
};


// =========================================
// CONFIGURAÇÃO DOS NÍVEIS
// =========================================

window.DIGIMASTER_LEVEL_CONFIG = Object.fromEntries(

  Object.entries(LESSONS).map(

    ([key, level]) => [

      key,

      {
        key,

        title:
          level.shortTitle ||
          level.title,

        fullTitle:
          level.title,

        total:
          level.lessons.length,

        ids:
          level.lessons.map(
            lesson =>
              lesson.id
          )
      }

    ]

  )

);


window.DIGIMASTER_MIN_ACCURACY =
  MIN_LESSON_ACCURACY;



// =========================================
// PROGRESSO DAS LIÇÕES
// =========================================

const LESSONS_STORAGE_KEY =
  'digimaster_lessons';



function loadLessonsProgress() {

  try {

    return JSON.parse(

      localStorage.getItem(
        LESSONS_STORAGE_KEY
      )

    ) || {};

  }

  catch {

    return {};

  }

}



// =========================================
// VERIFICAR SE A LIÇÃO FOI APROVADA
// =========================================

function isPassedProgress(item) {

  return (

    !!item &&

    item.completed !== false &&

    Number(
      item.accuracy ||
      0
    ) >=
    MIN_LESSON_ACCURACY

  );

}



// =========================================
// SALVAR LIÇÃO CONCLUÍDA
// =========================================

function saveLessonComplete(
  lessonId,
  wpm,
  accuracy
) {

  const progress =
    loadLessonsProgress();


  const previous =
    progress[
      lessonId
    ];


  const now =
    new Date()
      .toISOString();



  // Primeira conclusão

  if (!previous) {

    progress[
      lessonId
    ] = {

      completed:
        true,

      wpm:
        Number(
          wpm ||
          0
        ),

      accuracy:
        Number(
          accuracy ||
          0
        ),

      date:
        now,

      firstCompletedAt:
        now

    };

  }


  // Repetição da lição
  // Mantém a primeira data de conclusão.

  else {

    progress[
      lessonId
    ] = {

      ...previous,

      completed:
        true,

      wpm:
        Math.max(

          Number(
            previous.wpm ||
            0
          ),

          Number(
            wpm ||
            0
          )

        ),

      accuracy:
        Math.max(

          Number(
            previous.accuracy ||
            0
          ),

          Number(
            accuracy ||
            0
          )

        ),

      date:

        previous.date ||

        previous.firstCompletedAt ||

        now,

      firstCompletedAt:

        previous.firstCompletedAt ||

        previous.date ||

        now,

      lastImprovedAt:
        now

    };

  }



  localStorage.setItem(

    LESSONS_STORAGE_KEY,

    JSON.stringify(
      progress
    )

  );



  if (
    typeof saveLessonCloud ===
    'function'
  ) {

    saveLessonCloud(
      lessonId,
      wpm,
      accuracy
    );

  }

}



// =========================================
// PROGRESSO DO NÍVEL
// =========================================

function getLevelProgress(
  levelKey
) {

  const level =
    LESSONS[
      levelKey
    ];


  const progress =
    loadLessonsProgress();


  const passed =
    level.lessons.filter(

      lesson =>
        isPassedProgress(

          progress[
            lesson.id
          ]

        )

    );


  const total =
    level.lessons.length;


  const percent =

    total

      ?

      Math.round(

        (
          passed.length /
          total
        )

        *

        100

      )

      :

      0;



  // Procura as datas
  // de conclusão das lições.

  const dates =

    passed

      .map(

        lesson =>

          progress[
            lesson.id
          ]
            ?.firstCompletedAt

          ||

          progress[
            lesson.id
          ]
            ?.date

      )

      .filter(
        Boolean
      )

      .map(
        date =>
          new Date(
            date
          )
      )

      .filter(

        date =>
          !Number.isNaN(
            date.getTime()
          )

      );



  // A conclusão do nível acontece
  // na data em que a última lição
  // necessária foi concluída.

  const completedAt =

    passed.length === total &&
    dates.length

      ?

      new Date(

        Math.max(

          ...dates.map(

            date =>
              date.getTime()

          )

        )

      ).toISOString()

      :

      null;



  return {

    completed:
      passed.length,

    total,

    percent,

    isComplete:
      passed.length === total,

    completedAt

  };

}


window.getLevelProgress =
  getLevelProgress;



// =========================================
// DESBLOQUEAR PRÓXIMA LIÇÃO
// =========================================

function isLessonUnlocked(
  levelKey,
  lessonIndex
) {

  if (
    lessonIndex === 0
  ) {

    return true;

  }


  const previousLesson =

    LESSONS[
      levelKey
    ]
      .lessons[
        lessonIndex - 1
      ];


  return isPassedProgress(

    loadLessonsProgress()[

      previousLesson.id

    ]

  );

}



// =========================================
// LIÇÃO ATIVA
// =========================================

let activeLessonData =
  null;



function startLesson(
  levelKey,
  lessonId
) {

  const levelData =
    LESSONS[
      levelKey
    ];


  const lesson =

    levelData
      .lessons
      .find(

        item =>
          item.id ===
          lessonId

      );


  if (!lesson) {

    return;

  }



  activeLessonData = {

    levelKey,

    lesson

  };


  currentLevel =
    levelKey;


  currentText =
    lesson.text;



  const banner =
    document.getElementById(
      'activeLessonBanner'
    );


  const albTitle =
    document.getElementById(
      'albTitle'
    );


  const albSub =
    document.getElementById(
      'albSub'
    );


  const albIcon =
    document.getElementById(
      'albIcon'
    );



  if (banner) {

    if (albIcon) {

      albIcon.textContent =
        lesson.icon;

    }


    if (albTitle) {

      albTitle.textContent =

        `Lição ${lesson.num}: ${lesson.title}`;

    }


    if (albSub) {

      albSub.textContent =

        `${

          lesson.tip ||

          'Complete para registrar progresso'

        } · mínimo ${MIN_LESSON_ACCURACY}% de precisão`;

    }


    banner.classList.add(
      'visible'
    );

  }



  const levelSelect =
    document.getElementById(
      'levelSelect'
    );


  if (levelSelect) {

    levelSelect.value =
      levelKey;

  }



  navigateTo(
    'practice'
  );


  showToast(

    `📖 Lição ${lesson.num}: ${lesson.title} iniciada!`

  );

}



// =========================================
// SAIR DA LIÇÃO
// =========================================

function clearActiveLesson() {

  activeLessonData =
    null;


  document
    .getElementById(
      'activeLessonBanner'
    )
    ?.classList
    .remove(
      'visible'
    );

}



// =========================================
// VERIFICAR CONCLUSÃO
// =========================================

function checkLessonCompletion(
  wpm,
  accuracy
) {

  if (!activeLessonData) {

    return;

  }


  const {
    levelKey,
    lesson
  } =
    activeLessonData;



  // =====================================
  // ABAIXO DE 80%
  // =====================================

  if (

    Number(
      accuracy ||
      0
    )

    <

    MIN_LESSON_ACCURACY

  ) {

    showToast(

      `🎯 Você fez ${accuracy}% de precisão. Para concluir a lição, precisa de pelo menos ${MIN_LESSON_ACCURACY}%. Tente novamente!`

    );


    renderLessonsPanel(
      levelKey
    );


    return;

  }



  // =====================================
  // APROVADO
  // =====================================

  const before =
    getLevelProgress(
      levelKey
    );


  saveLessonComplete(
    lesson.id,
    wpm,
    accuracy
  );


  const after =
    getLevelProgress(
      levelKey
    );



  showToast(

    `✅ Lição ${lesson.num} concluída! ${wpm} WPM · ${accuracy}% precisão`

  );


  clearActiveLesson();


  renderLessonsPanel(
    levelKey
  );



  // =====================================
  // NÍVEL COMPLETO
  // =====================================

  if (

    !before.isComplete &&

    after.isComplete

  ) {

    setTimeout(

      () =>

        showToast(

          `🎓 Parabéns! Você concluiu 100% do nível ${

            LESSONS[
              levelKey
            ]
              .shortTitle

            ||

            levelKey

          }.`

        ),

      900

    );

  }

}



// =========================================
// RENDERIZAR LIÇÕES
// =========================================

function renderLessons() {

  renderLessonsTabs();


  const activeTab =

    document
      .querySelector(
        '.lesson-tab.active'
      )
      ?.dataset
      .tab

    ||

    'basico';


  renderLessonsPanel(
    activeTab
  );

}



// =========================================
// ABAS DOS NÍVEIS
// =========================================

let lessonsTabsBound =
  false;



function renderLessonsTabs() {

  if (lessonsTabsBound) {

    return;

  }


  lessonsTabsBound =
    true;


  document
    .querySelectorAll(
      '.lesson-tab'
    )
    .forEach(

      tab => {

        tab.addEventListener(

          'click',

          () => {

            document
              .querySelectorAll(
                '.lesson-tab'
              )
              .forEach(

                item =>
                  item
                    .classList
                    .remove(
                      'active'
                    )

              );


            tab.classList.add(
              'active'
            );


            renderLessonsPanel(
              tab.dataset.tab
            );

          }

        );

      }

    );

}



// =========================================
// PAINEL DE LIÇÕES
// =========================================

function renderLessonsPanel(
  levelKey
) {

  const container =
    document.getElementById(
      'lessonsPanels'
    );


  if (!container) {

    return;

  }


  const levelData =
    LESSONS[
      levelKey
    ];


  const progress =
    loadLessonsProgress();


  const levelProgress =
    getLevelProgress(
      levelKey
    );


  const completionDate =

    levelProgress.completedAt

      ?

      new Date(
        levelProgress.completedAt
      )
        .toLocaleDateString(

          'pt-BR',

          {
            day:
              '2-digit',

            month:
              '2-digit',

            year:
              'numeric'
          }

        )

      :

      null;



  container.innerHTML = `

    <div class="lessons-panel active">


      <div class="lessons-panel-header">


        <h2
          style="
            color:${levelData.color}
          "
        >
          ${levelData.title}
        </h2>


        <p>
          ${levelData.desc}
        </p>


        <div
          style="
            margin-top:12px;
            display:flex;
            align-items:center;
            gap:12px
          "
        >


          <div
            style="
              flex:1;
              height:4px;
              background:var(--bg3);
              border-radius:2px;
              overflow:hidden
            "
          >

            <div
              style="
                height:100%;
                width:${levelProgress.percent}%;
                background:${levelData.color};
                border-radius:2px;
                transition:width .5s;
                box-shadow:0 0 8px ${levelData.color}
              "
            >
            </div>

          </div>


          <span
            style="
              font-family:var(--font-title);
              font-size:12px;
              color:${levelData.color};
              letter-spacing:1px;
              flex-shrink:0
            "
          >
            ${levelProgress.completed}/${levelProgress.total} concluídas
          </span>


        </div>


        <div
          style="
            margin-top:10px;
            font-size:12px;
            color:${
              levelProgress.isComplete
                ? 'var(--correct)'
                : 'var(--text3)'
            }
          "
        >

          ${
            levelProgress.isComplete

              ?

              `✅ Nível concluído em ${completionDate}`

              :

              `🎯 Cada lição exige no mínimo ${MIN_LESSON_ACCURACY}% de precisão para ser concluída.`
          }

        </div>


      </div>


      <div class="lessons-grid">

        ${

          levelData
            .lessons
            .map(

              (
                lesson,
                index
              ) =>

                renderLessonCard(

                  lesson,
                  index,
                  levelKey,
                  progress

                )

            )
            .join('')

        }

      </div>


    </div>

  `;

}



// =========================================
// CARD INDIVIDUAL DA LIÇÃO
// =========================================

function renderLessonCard(
  lesson,
  index,
  levelKey,
  progress
) {

  const best =
    progress[
      lesson.id
    ];


  const done =
    isPassedProgress(
      best
    );


  const unlocked =
    isLessonUnlocked(
      levelKey,
      index
    );



  const keyPreviews =

    lesson.keys.length

      ?

      lesson.keys
        .slice(
          0,
          8
        )
        .map(

          key => `

            <span
              class="
                lesson-key-preview ${
                  lesson.homeKeys.includes(
                    key
                  )
                    ? 'home'
                    : ''
                }
              "
            >
              ${String(key).toUpperCase()}
            </span>

          `

        )
        .join('')

      :

      lesson.homeKeys
        .slice(
          0,
          6
        )
        .map(

          key => `

            <span
              class="
                lesson-key-preview home
              "
            >
              ${String(key).toUpperCase()}
            </span>

          `

        )
        .join('');



  const buttonText =

    !unlocked

      ?

      '🔒 Bloqueado'

      :

      done

        ?

        '↺ Repetir'

        :

        '▶ Iniciar';



  const cardClass =

    done

      ?

      'completed'

      :

      !unlocked

        ?

        'locked'

        :

        '';



  const introTag =

    lesson.isIntro

      ?

      '<span class="lesson-badge-tag intro-tag">⭐ Introdução</span>'

      :

      '';



  const challengeTag =

    lesson.isChallenge

      ?

      '<span class="lesson-badge-tag challenge-tag">🏆 Desafio</span>'

      :

      '';



  const bestDisplay =

    best

      ?

      `

        <div
          class="lesson-best"
          style="
            color:${
              done
                ? 'var(--correct)'
                : 'var(--wrong)'
            }
          "
        >

          ${
            done
              ? '✓ Concluída'
              : '⚠ Ainda não concluída'
          }:

          ${best.wpm || 0} WPM ·
          ${best.accuracy || 0}%

        </div>

      `

      :

      `

        <div
          class="lesson-best"
          style="
            color:var(--text3)
          "
        >
          Mínimo: ${MIN_LESSON_ACCURACY}% de precisão
        </div>

      `;



  const clickAction =

    unlocked

      ?

      `startLesson('${levelKey}','${lesson.id}')`

      :

      '';



  return `

    <div
      class="
        lesson-card ${cardClass}
      "
      onclick="
        ${clickAction}
      "
    >


      <div class="lesson-num">


        <span>

          LIÇÃO ${lesson.num}

          ${introTag}

          ${challengeTag}

        </span>


        <span
          class="
            lesson-badge-icon
          "
        >

          ${lesson.icon}

          ${
            done
              ? ' ✅'
              : ''
          }

        </span>


      </div>


      <h3>
        ${lesson.title}
      </h3>


      <p>
        ${lesson.desc}
      </p>


      <div class="lesson-keys">
        ${keyPreviews}
      </div>


      <div class="lesson-footer">


        <div>


          <div class="lesson-xp">

            XP:

            <span>
              +${lesson.xp}
            </span>

          </div>


          ${bestDisplay}


        </div>


        <button
          class="
            lesson-play-btn ${
              !unlocked
                ? 'locked-btn'
                : ''
            }
          "
          onclick="
            event.stopPropagation();
            ${clickAction}
          "
        >

          ${buttonText}

        </button>


      </div>


      <div class="lesson-progress">

        <div
          class="
            lesson-progress-fill
          "
          style="
            width:${
              done
                ? '100'
                : '0'
            }%
          "
        >
        </div>

      </div>


    </div>

  `;

}



// =========================================
// BOAS-VINDAS
// =========================================

function checkWelcome() {

  const hide =
    localStorage.getItem(
      'digimaster_hide_welcome'
    );


  if (!hide) {

    document
      .getElementById(
        'welcomeOverlay'
      )
      ?.classList
      .add(
        'open'
      );

  }

}



function closeWelcome() {

  const overlay =
    document.getElementById(
      'welcomeOverlay'
    );


  if (overlay) {

    overlay.classList.remove(
      'open'
    );


    overlay.style.display =
      'none';

  }

}



function saveDontShow(
  checked
) {

  if (checked) {

    localStorage.setItem(
      'digimaster_hide_welcome',
      '1'
    );

  }

  else {

    localStorage.removeItem(
      'digimaster_hide_welcome'
    );

  }

}



// =========================================
// TOAST
// =========================================

function showToast(msg) {

  const toast =
    document.getElementById(
      'toast'
    );


  if (!toast) {

    return;

  }


  toast.textContent =
    msg;


  toast.classList.add(
    'show'
  );


  setTimeout(

    () =>
      toast.classList.remove(
        'show'
      ),

    3500

  );

}
