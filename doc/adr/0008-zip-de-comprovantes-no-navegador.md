# 0008. O arquivo compactado dos comprovantes é montado no navegador, com fflate

- **Status:** Proposta
- **Data:** 15/11/2026

## Contexto

O aluno entrega à coordenação os comprovantes que contam, num arquivo compactado com uma pasta por
item (RF36, tela de Atividades). O `doc/tecnologia.md` já pede que o arquivo saia dos mesmos dados
que a pessoa acabou de ver e que a biblioteca de compactação entre com import dinâmico, mas não diz
onde o arquivo é montado nem com qual biblioteca. A issue da tela pediu essa decisão.

## Decisão

- **O zip é montado no navegador.** A tela baixa cada comprovante pelo service
  (`getProofFile`, alvo: `storage.download` no bucket `comprovantes`, ADR 0004), um por vez, e junta
  tudo no fim. A lista do que entra é a mesma que a tela mostra (`status` do cálculo único).
- **Biblioteca: `fflate`**, carregada com `import()` só no clique de "Baixar os que contam". Sem
  compressão (`level: 0`): PDF, JPG e PNG já vêm compactados, e comprimir de novo só gasta bateria.
- **Uma pasta por item**, `Item 06 - <nome do item>/<nome da atividade>.<extensão>`, sem nome
  repetido e sem caractere que o Windows recuse.
- **Cancelar não é erro.** O download usa `AbortController`. Cancelado, nada é salvo e a tela volta
  ao botão. Falha no meio mostra que nada foi salvo e deixa tentar de novo.

## Consequências

- Nenhum servidor nem segredo novo: o isolamento entre alunos continua no RLS do Storage.
- O zip inteiro fica na memória do aparelho enquanto é montado. Com o limite de 10 MB por
  comprovante, um aluno com 8 comprovantes grandes chega a uns 80 MB, aceitável num celular atual.
  Se um curso exigir muito mais arquivos, a montagem passa a ser em fluxo (`Zip` do `fflate`) ou
  vai para o servidor, numa ADR que substitui esta.
- O `fflate` (cerca de 8 KB com gzip) não entra no carregamento inicial da tela.
- Quem trocar o mock pelo Supabase muda só o `getProofFile`.

## Alternativas descartadas

- **Montar no servidor (Route Handler):** precisaria repassar a sessão ou usar a `service_role`,
  criaria um segundo caminho de leitura dos comprovantes e faria cada arquivo passar duas vezes pela
  rede. Não ganha em segurança, porque o RLS já isola.
- **JSZip:** API parecida, mas bem mais pesada (cerca de 100 KB) e mais lenta.
- **client-zip:** menor e monta em fluxo, mas o progresso por arquivo e o cancelamento ficam mais
  difíceis de controlar. Volta à mesa se a montagem em memória deixar de servir.
- **Baixar um arquivo por vez, sem zip:** o protótipo pede um arquivo só, com pasta por item, e o
  celular encheria a pasta de downloads de arquivos soltos.
