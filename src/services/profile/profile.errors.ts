/**
 * O aluno tem atividades registradas e tentou trocar de curso (RF10). A regra também vale no banco.
 * A tela mostra os dois caminhos: remover as atividades ou apagar a conta e começar de novo.
 */
export class CourseLockedError extends Error {
  constructor() {
    super('Com atividades registradas, o curso fica travado.')
    this.name = 'CursoTravadoError'
  }
}
