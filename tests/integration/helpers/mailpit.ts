// O Auth local não envia e-mail de verdade: tudo cai no Mailpit (supabase/config.toml, porta 54324).
const MAILPIT_API = 'http://127.0.0.1:54324/api/v1'

type MessageSummary = { ID: string; Subject: string }
type MessageDetail = { HTML: string; Subject: string }

/** Link de e-mail já aberto: o token que a tela recebe em `?token=` e o assunto da mensagem. */
export type EmailLink = { token: string; subject: string; count: number }

async function listMessages(to: string): Promise<MessageSummary[]> {
  const response = await fetch(`${MAILPIT_API}/search?query=${encodeURIComponent(`to:${to}`)}`)
  const body = (await response.json()) as { messages: MessageSummary[] }

  return body.messages
}

/** Quantos e-mails o Mailpit guarda para o endereço. */
export async function countEmails(to: string): Promise<number> {
  return (await listMessages(to)).length
}

/**
 * Espera chegar o e-mail de número `expectedCount` para o endereço e devolve o token do link dele.
 *
 * @param to Endereço do aluno.
 * @param expectedCount Quantos e-mails o endereço já deve ter. O reenvio pede 2, por exemplo.
 * @throws Error se o e-mail não chegar em 8 segundos ou se não houver `?token=` no HTML.
 */
export async function waitForEmailLink(to: string, expectedCount = 1): Promise<EmailLink> {
  const deadline = Date.now() + 8_000

  while (Date.now() < deadline) {
    const messages = await listMessages(to)

    if (messages.length >= expectedCount) {
      // O Mailpit lista da mensagem mais nova para a mais antiga.
      const detail = (await (
        await fetch(`${MAILPIT_API}/message/${messages[0].ID}`)
      ).json()) as MessageDetail
      const token = /[?&]token=([^"&\s<]+)/.exec(detail.HTML)?.[1]

      if (!token) throw new Error(`O e-mail "${detail.Subject}" não traz um link com ?token=.`)
      return { token, subject: detail.Subject, count: messages.length }
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`Nenhum e-mail chegou para ${to} em 8 segundos. O Mailpit está no ar?`)
}
