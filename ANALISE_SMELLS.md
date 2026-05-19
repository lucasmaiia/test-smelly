# Análise Manual de Test Smells

**Arquivo analisado:** `test/userService.smelly.test.js`

---

## Smell 1: Lógica Condicional (Conditional Test Logic)

**Teste:** `deve desativar usuários se eles não forem administradores`
**Linhas:** 40–51

```js
for (const user of todosOsUsuarios) {
  const resultado = userService.deactivateUser(user.id);
  if (!user.isAdmin) {
    expect(resultado).toBe(true);
    ...
  } else {
    expect(resultado).toBe(false);
  }
}
```

**Problema:** O teste contém um `for` com um `if/else` interno. Testes devem ter um caminho de execução linear e previsível. Com lógica condicional, diferentes `expect`s rodam dependendo dos dados, tornando difícil saber o que está sendo verificado e facilitando que bugs passem despercebidos.

**Correção sugerida:** Separar em dois testes independentes — um para usuário comum, outro para administrador.

---

## Smell 2: Teste Frágil (Fragile Test / Overspecification)

**Teste:** `deve gerar um relatório de usuários formatado`
**Linhas:** 61–63

```js
const linhaEsperada = `ID: ${usuario1.id}, Nome: Alice, Status: ativo\n`;
expect(relatorio).toContain(linhaEsperada);
expect(relatorio.startsWith('--- Relatório de Usuários ---')).toBe(true);
```

**Problema:** O teste valida a formatação exata da string de saída (vírgulas, espaçamentos, cabeçalho). Qualquer mudança cosmética no método `generateUserReport()` — como adicionar um campo, mudar a ordem ou um espaço — quebra o teste, mesmo que o comportamento continue correto. O teste está acoplado à implementação, não ao comportamento.

**Correção sugerida:** Verificar apenas os dados relevantes (presença do nome, do ID, do status), sem depender do formato exato da string.

---

## Smell 3: Asserção Silenciosa (Silent Test / Missing Assertion)

**Teste:** `deve falhar ao criar usuário menor de idade`
**Linhas:** 70–75

```js
try {
  userService.createUser('Menor', 'menor@email.com', 17);
} catch (e) {
  expect(e.message).toBe('O usuário deve ser maior de idade.');
}
```

**Problema:** Se `createUser` **não** lançar nenhuma exceção (ex: a validação for removida acidentalmente), o `catch` nunca executa, nenhum `expect` roda, e o teste **passa silenciosamente** — escondendo um bug crítico. O teste não garante que a exceção seja lançada.

**Correção sugerida:** Usar `expect(() => userService.createUser(...)).toThrow('O usuário deve ser maior de idade.')`, que falha explicitamente quando a exceção não ocorre.

---

## Smell 4: Teste Ignorado / Fantasma (Ignored Test)

**Teste:** `deve retornar uma lista vazia quando não há usuários`
**Linha:** 77

```js
test.skip('deve retornar uma lista vazia quando não há usuários', () => {
  // TODO: Implementar este teste depois.
});
```

**Problema:** O `test.skip` com corpo vazio e um TODO é um **Teste Fantasma**. Ele ocupa espaço, cria falsa sensação de cobertura e raramente é implementado. A suíte reporta o teste como "ignorado", mascarando a ausência real de cobertura para esse cenário.

**Correção sugerida:** Implementar o teste imediatamente ou removê-lo até que haja intenção real de implementá-lo.

---

## Resumo

| # | Smell | Linhas |
|---|-------|--------|
| 1 | Lógica Condicional | 40–51 |
| 2 | Teste Frágil (formato hardcoded) | 61–63 |
| 3 | Asserção Silenciosa (try/catch sem garantia) | 70–75 |
| 4 | Teste Ignorado / Fantasma | 77 |

---

## Detecção Automática com ESLint

**Comando executado:** `npx eslint .`

**Resultado:** 6 problemas encontrados (4 erros, 2 avisos)

```
test/userService.smelly.test.js
  44:9  error    Avoid calling `expect` conditionally   jest/no-conditional-expect
  46:9  error    Avoid calling `expect` conditionally   jest/no-conditional-expect
  49:9  error    Avoid calling `expect` conditionally   jest/no-conditional-expect
  73:7  error    Avoid calling `expect` conditionally   jest/no-conditional-expect
  77:3  warning  Tests should not be skipped            jest/no-disabled-tests
  77:3  warning  Test has no assertions                 jest/expect-expect
```

### Erros — `jest/no-conditional-expect`

| Linha | Smell correspondente |
|-------|----------------------|
| 44, 46, 49 | Smell 1 — Lógica Condicional (`expect` dentro de `if/else`) |
| 73 | Smell 3 — Asserção Silenciosa (`expect` dentro de `catch`) |

### Avisos — linha 77

| Regra | Smell correspondente |
|-------|----------------------|
| `jest/no-disabled-tests` | Smell 4 — Teste Ignorado (`test.skip`) |
| `jest/expect-expect` | Teste sem nenhuma asserção |

---

## Comparação: Análise Manual vs. ESLint

| Smell | Detectado Manualmente | Detectado pelo ESLint |
|-------|-----------------------|----------------------|
| 1 — Lógica Condicional | Sim | Sim (linhas 44, 46, 49) |
| 2 — Teste Frágil (string hardcoded) | Sim | **Não** |
| 3 — Asserção Silenciosa (try/catch) | Sim | Sim (linha 73) |
| 4 — Teste Ignorado | Sim | Sim (linha 77) |

**Conclusão:** O ESLint detectou 3 dos 4 smells. O **Smell 2 (Teste Frágil)** — que valida o formato exato da string do relatório — escapou à análise automática, pois exige julgamento semântico sobre o design do teste, algo que ferramentas estáticas não conseguem capturar. Isso demonstra que **análise manual e automática são complementares**.
