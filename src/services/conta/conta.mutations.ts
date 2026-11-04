import type { QueryClient } from '@tanstack/react-query'

import { apagarTodasAsCopias, simularLatencia, writeDb } from '../_mock'
import { progressoKeys } from '../progresso/progresso.keys'
import { isEmailAluno } from '@/utils/validacoes'

import { requireConta, toSessao } from './conta.api'
import {
  CursoTravadoError,
  EmailJaCadastradoError,
  EmailNaoInstitucionalError,
  SenhaNaoConfereError,
} from './conta.errors'
import { contaKeys } from './conta.keys'
import type { PerfilInput, Sessao } from './conta.types'

const normalizar = (email: string): string => email.trim().toLowerCase()

export async function entrar(email: string, senha: string): Promise<Sessao> {
  await simularLatencia(600)

  const db = writeDb((db) => {
    // Sem saber o motivo exato, a mensagem é a mesma para e-mail ou senha errados.
    if (!db.conta || db.conta.email !== normalizar(email) || db.conta.senha !== senha) {
      throw new SenhaNaoConfereError()
    }
    db.hasSessao = true
  })

  return toSessao(db.conta!)
}

export async function criarConta(email: string, senha: string): Promise<Sessao> {
  await simularLatencia(600)
  if (!isEmailAluno(email)) throw new EmailNaoInstitucionalError()

  const db = writeDb((db) => {
    if (db.conta?.email === normalizar(email)) throw new EmailJaCadastradoError()

    // O mock guarda uma conta só: criar outra substitui a anterior.
    db.conta = {
      email: normalizar(email),
      senha,
      nome: null,
      matricula: null,
      cursoId: null,
      ingresso: null,
      isEmailConfirmado: false,
      linkEnviadoEm: new Date().toISOString(),
    }
    db.hasSessao = true
    db.atividades = []
  })
  apagarTodasAsCopias()

  return toSessao(db.conta!)
}

export async function reenviarLink(): Promise<void> {
  await simularLatencia()
  requireConta()
  writeDb((db) => {
    db.conta!.linkEnviadoEm = new Date().toISOString()
  })
}

export async function corrigirEmail(email: string): Promise<void> {
  await simularLatencia()
  if (!isEmailAluno(email)) throw new EmailNaoInstitucionalError()

  requireConta()
  writeDb((db) => {
    db.conta!.email = normalizar(email)
    db.conta!.linkEnviadoEm = new Date().toISOString()
  })
}

// Faz o papel do clique no link do e-mail, que o mock não envia.
export async function confirmarEmail(): Promise<void> {
  requireConta()
  writeDb((db) => {
    db.conta!.isEmailConfirmado = true
  })
}

export async function sair(): Promise<void> {
  await simularLatencia(150)
  writeDb((db) => {
    db.hasSessao = false
  })
}

// Conta confirmada pede a senha (RF33). A não confirmada sai sem senha, pela tela de verificação.
export async function apagarConta(senha?: string): Promise<void> {
  await simularLatencia(600)
  const conta = requireConta()
  if (conta.isEmailConfirmado && conta.senha !== senha) throw new SenhaNaoConfereError()

  writeDb((db) => {
    db.conta = null
    db.hasSessao = false
    db.atividades = []
  })
  apagarTodasAsCopias()
}

// Não revela se o e-mail tem conta: a resposta é sempre a mesma.
export async function pedirNovaSenha(email: string): Promise<void> {
  await simularLatencia(500)
  if (!isEmailAluno(email)) throw new EmailNaoInstitucionalError()
}

export async function salvarNovaSenha(senha: string): Promise<void> {
  await simularLatencia(500)
  writeDb((db) => {
    // Link de nova senha sem conta é link vencido: a tela já mostra esse estado antes de chegar aqui.
    if (!db.conta) throw new Error('Este link não vale mais.')
    db.conta.senha = senha
    // Sai dos outros aparelhos: no mock, encerra a sessão deste também.
    db.hasSessao = false
  })
}

export async function definirCurso(cursoId: string, ingresso: string): Promise<Sessao> {
  await simularLatencia(400)
  requireConta()

  const db = writeDb((db) => {
    if (db.conta!.cursoId !== cursoId && db.atividades.length > 0) {
      throw new CursoTravadoError(db.atividades.length)
    }
    db.conta!.cursoId = cursoId
    db.conta!.ingresso = ingresso
  })

  return toSessao(db.conta!)
}

export async function atualizarPerfil(input: PerfilInput): Promise<Sessao> {
  await simularLatencia(400)
  requireConta()

  const db = writeDb((db) => {
    Object.assign(db.conta!, input)
  })

  return toSessao(db.conta!)
}

// Perfil e curso mudam o cálculo (ingresso) e o formulário (nome, matrícula).
export function invalidateAfterContaWrite(qc: QueryClient): void {
  qc.invalidateQueries({ queryKey: contaKeys.all })
  qc.invalidateQueries({ queryKey: progressoKeys.all })
}
