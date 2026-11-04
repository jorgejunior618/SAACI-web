# Camada de serviços

Fronteira entre as telas e a origem do dado. Hoje a origem é um mock guardado no navegador; quando o backend
existir, só esta camada muda. `services/atividades/` é o exemplo vivo.

## Arquivos de um domínio

| Arquivo              | Responsabilidade                                              |
| -------------------- | ------------------------------------------------------------- |
| `<dom>.types.ts`     | schema Valibot e tipo de domínio                              |
| `<dom>.mock.ts`      | o que só existe no mock (ex.: leitura do comprovante fingida) |
| `<dom>.api.ts`       | leitura                                                       |
| `<dom>.mutations.ts` | escrita e rotina de invalidação                               |
| `<dom>.keys.ts`      | chaves de cache                                               |
| `<dom>.queries.ts`   | definições de query reaproveitáveis                           |
| `<dom>.errors.ts`    | erro de domínio nomeado, quando o primeiro aparecer           |
| `index.ts`           | superfície pública, sem reexportar o mock                     |

## O mock

`services/_mock/` faz o papel do backend: um banco em JSON no `localStorage` (`saaci:mock`), que
**começa vazio**. Conta, curso e atividades nascem do que a pessoa faz na aplicação.

- O mock ordena, filtra e calcula ali dentro, não na tela.
- A leitura devolve cópia (`structuredClone`), como uma resposta de rede faria.
- Só existe uma conta por navegador: criar outra substitui a anterior.
- O que o mock não consegue fazer pela tela (o clique no link de confirmação do e-mail) fica no
  painel "Mock", que só aparece em desenvolvimento, junto com o botão que apaga tudo.
- Comprovante: o localStorage tem cerca de 5 MB, então o arquivo não é guardado inteiro. Foto
  vira uma cópia reduzida em JPEG (no máximo 1280px, cerca de 220 KB), numa chave própria
  (`saaci:comprovante:<id>`) que some junto com a atividade. PDF guarda só nome, tipo e tamanho.
  Na aba em que foi registrado, o original continua disponível em memória.
- Sem espaço para a cópia, a atividade é salva sem ela. Sem espaço para o registro, nada é salvo.
- Testes montam o estado com `aplicarFixture()` (`_mock/fixtures.ts`), que a aplicação não usa.

## Regras

- O service devolve Promise, mesmo sobre o mock.
- Toda saída do service passa por `v.parse`.
- O service não conhece React nem TanStack Query.
- Nome de função carrega o domínio: `createAtividade`, não `create`.
- Erro sem tradução conhecida é lançado, nunca engolido. Quem trata é a tela.
