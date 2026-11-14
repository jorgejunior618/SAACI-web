---
name: saaci-roteiro-manual
description: Roteiro manual ponta a ponta no navegador, para conferir um fluxo importante e complexo antes do PR. Use só quando o dev pedir, ou sugira em uma linha ao fechar um fluxo que cruza várias telas com estado externo (login, e-mail, sessão, apagar dado). Nunca rode sozinha e não sugira para tela isolada, ajuste visual ou fluxo simples.
---

# saaci-roteiro-manual

Percorre o fluxo como o aluno faria, no navegador, contra o banco local. Complementa os testes, não os
substitui: pega o que teste não pega (tela que não hidrata, link que abre na origem errada, estado que
fica preso). É pesado, por isso é **opt-in**.

## Quando sugerir

Sugira em **uma linha**, ao fechar a última etapa, só se o fluxo tiver **3 ou mais** destes sinais:

- cruza 3 ou mais telas ou rotas;
- depende de estado fora da tela (e-mail com link, cookie de sessão, redirecionamento por perfil);
- tem passo que não se repete (link de uso único, apagar conta, pagamento);
- um erro aqui passa despercebido nos testes e só aparece para o aluno.

Exemplos que valem: conta e login, envio de atividade com comprovante, troca de curso com atividades.
Exemplos que **não** valem: ajuste de texto, uma tela de lista, componente do design system, correção
pontual. Nesses, não ofereça.

Frase de sugestão: "Este fluxo é crítico. Quer o roteiro manual no navegador antes do PR? Leva alguns
minutos."

## Regras

- Só executa depois do "sim" do dev. Antes, pergunte se prefere que a IA dirija o Chrome ou receba o
  roteiro escrito para percorrer sozinho.
- **Nunca contra o projeto remoto.** Confira o host de `NEXT_PUBLIC_SUPABASE_URL` (só o host, nunca a
  chave): tem de ser `127.0.0.1:54321`. O `pnpm dev` só lê `.env.development.local`.
- Só dados de teste, com e-mail novo por rodada (`manual.<fluxo>.<mmdd><letra>@aluno.ifce.edu.br`).
  Apague pela própria tela o que o roteiro cria e confirme no banco.
- Parar e perguntar se o navegador falhar 2 ou 3 vezes seguidas. Não insista no mesmo clique.

## Preparação (cada item já custou tempo)

1. Docker aberto e `pnpm db:start`. Teste com `pnpm db:status`.
2. Nenhum `next dev` antigo na porta 3000 (`curl -sI localhost:3000`, `ps`). Um servidor iniciado antes
   de mudar o env segue com o env velho. Peça aprovação para encerrá-lo.
3. Subir `pnpm dev` e conferir na saída `Environments: .env.development.local` e a porta 3000.
4. Abrir sempre `http://localhost:3000`, nunca `127.0.0.1` (README, seção "Banco local").
5. Chrome: a extensão precisa estar logada na mesma conta. Sem conexão, o fallback é o roteiro escrito.

## Como percorrer

- Agrupe os passos em `browser_batch` (navegar, preencher, clicar, esperar, capturar).
- Pegue os campos com `read_page` (filtro `interactive`) e use `form_input` para preencher.
- Link de e-mail: leia pela API do Mailpit (`http://127.0.0.1:54324/api/v1/search?query=to:<e-mail>` e
  `/message/<ID>`), nunca pela tela do Mailpit.
- Se o lote perder a conexão, **não repita**: veja o estado da aba (URL e captura) e continue de onde parou.
- Capture a tela de cada estado: o que o aluno lê importa tanto quanto o fluxo concluir.

## Entrega

Uma tabela `caso | resultado`, uma linha por estado, e depois **só o que deu errado ou ficou sem
cobrir**, com a causa e a sugestão. Não repita o que passou. Se achou defeito de configuração, proponha
a correção e peça aprovação.

O roteiro de cada fluxo mora em `references/`. Hoje: `references/fluxo-conta.md`. Ao criar um novo,
copie a estrutura dele.
