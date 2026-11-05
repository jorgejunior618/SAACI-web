# Camada de serviços

Fronteira entre as telas e a origem do dado. Hoje a origem é um mock guardado no navegador; quando o backend
existir, só esta camada muda. `services/conta/` é o exemplo vivo.

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
**começa vazio**. Hoje ele guarda só a conta e a sessão (`versao: 3`).

- O mock ordena, filtra e calcula ali dentro, não na tela.
- A leitura devolve cópia (`structuredClone`), como uma resposta de rede faria.
- Só existe uma conta por navegador: criar outra substitui a anterior.
- O que o mock não consegue fazer pela tela fica no painel "Mock", que só aparece em
  desenvolvimento. Sem tela de cadastro, é lá que se cria a conta de exemplo
  (`criarContaDeExemplo()`, com `CONTA_FIXTURE`), e lá fica o botão que apaga tudo.
- Testes montam o estado com `aplicarFixture()` (`_mock/fixtures.ts`).
- Mudou o formato do banco, sobe `versao`: o formato antigo salvo no navegador é descartado.

## Regras

- O service devolve Promise, mesmo sobre o mock.
- Toda saída do service passa por `v.parse`.
- O service não conhece React nem TanStack Query.
- Nome de função carrega o domínio: `createAtividade`, não `create`.
- Erro sem tradução conhecida é lançado, nunca engolido. Quem trata é a tela.
