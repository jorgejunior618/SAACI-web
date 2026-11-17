# 0010. O PDF do formulário da coordenação é gerado no navegador, com pdf-lib

- **Status:** Proposta
- **Data:** 17/11/2026

## Contexto

O aluno baixa o formulário de solicitação de atividades complementares já preenchido (RF37). O
download fica no passo 1 do roadmap de entrega (tela Como entregar), e a tela Seu pedido só confere o
formulário e mostra a prévia. O `doc/tecnologia.md` pede que o arquivo saia dos mesmos dados que a
pessoa acabou de ver, mas não diz onde o PDF é montado nem com qual biblioteca. A issue da tela pediu essa decisão.

## Decisão

- **O PDF é montado no navegador.** A tela passa à função os dados que já mostra (`progress`,
  `profile`, itens do curso). Nenhuma conta é refeita para o arquivo (RNF20).
- **Biblioteca: `pdf-lib`**, carregada com `import()` só no clique de "Baixar formulário em PDF"
  do roadmap de entrega, como o `fflate` da ADR 0008. Fora do carregamento inicial da tela.
- **A página é desenhada pelo código:** A4, cabeçalho do campus e da coordenação, aluno, matrícula,
  tabela com todos os itens do curso (horas ou traço), total e a data de geração. A fonte é a
  Helvetica padrão do PDF, que cobre os acentos do português.
- **Há duas versões:** preenchida e em branco, a mesma função com `blank`.
- **O download é um `Blob`** com `URL.createObjectURL`, revogada ao sair da tela.

## Consequências

- Nenhum servidor nem segredo novo, e o isolamento entre alunos continua no RLS.
- A `pdf-lib` pesa cerca de 170 KB com gzip, pagos só por quem baixa o formulário.
- A `pdf-lib` está sem release há anos. Se aparecer problema sem correção, o fork `@cantoo/pdf-lib`
  mantém a mesma API e entra por uma ADR que substitui esta.
- A Helvetica padrão só aceita caracteres do Latin-1. Nome com caractere fora dele faz a geração
  falhar, e a tela diz ao aluno para conferir o nome no Perfil. Embutir uma fonte própria pediria o
  `@pdf-lib/fontkit` e o arquivo da fonte.
- Se a coordenação entregar o PDF oficial para preencher, a `pdf-lib` já lê e preenche arquivo
  existente, e só a função de montagem muda.

## Alternativas descartadas

- **jsPDF com autotable:** mais leve e a tabela sai pronta, mas não preenche um PDF oficial
  existente. Se a coordenação exigir o modelo dela, a biblioteca seria trocada.
- **`@react-pdf/renderer`:** perto de 1 MB, e o documento é descrito em componentes próprios, fora
  do Panda e do design system.
- **Gerar no servidor (Route Handler):** criaria um segundo caminho de leitura dos dados e
  contraria `tecnologia.md` (`app/api/` só para segredo e agendamento). Não ganha em segurança,
  porque o RLS já isola.
