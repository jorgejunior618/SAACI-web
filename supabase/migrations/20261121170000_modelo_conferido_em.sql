-- Data em que a coordenação conferiu o modelo de formulário do curso. A tela Pedido mostra
-- "conferido em dd/mm/aaaa" quando há data (ADR 0018). Começa nula: nenhum curso foi conferido ainda,
-- e a data só entra por migration, quando a coordenação informar.
alter table public.cursos add column modelo_conferido_em date;
