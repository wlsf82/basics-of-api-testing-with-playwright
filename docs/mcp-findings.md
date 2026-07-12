# MCP Findings — `GET /customers`

## Initial prompt

> Using Playwright's MCP, explore the GET `/customers` API, and my existing test suite at `tests/customers.spec.ts` to find any gaps.

## How this was explored

The live API at `http://localhost:3001` was explored via Playwright's MCP (~37 request
variations), and its real behavior was compared against `tests/customers.spec.ts`.

## What the API actually supports (discovered)

- **Valid `size` values:** `All`, `Small`, `Medium`, `Enterprise`, `Large Enterprise`, `Very Large Enterprise`
- **Valid `industry` values:** `All`, `Logistics`, `Retail`, `Technology`, `HR`, `Finance`
- **Default page size is 10** (no params → 10 customers, `totalPages: 5`, `totalCustomers: 50`)
- **Error responses carry a descriptive `error` field**, e.g.
  `"Unsupported size value. Supported values are..."` and
  `"Invalid page or limit. Both must be positive numbers."`
- **`contactInfo` can be `null`** (real records return it); `address` was always present in what was observed.

## Gaps in the current suite

### Coverage gaps (untested valid behavior)

1. **The `All` meta-value** — `size=All` / `industry=All` return the full set (200). Completely untested.
2. **Multi-word sizes** — only `Medium` is tested. `Small`, `Enterprise`, `Large Enterprise`,
   `Very Large Enterprise` (and non-`Technology` industries) are never exercised. These
   multi-word/space-containing values are exactly where filtering bugs hide.
3. **Combined filters** — `size=Medium&industry=Technology` works and narrows correctly (3 results).
   No test combines parameters.
4. **`page` + `limit` together** — untested.
5. **Default page size = 10** — never asserted anywhere.
6. **Error response *body*** — every negative test asserts only `status === 400`, never the `error`
   message. Wrong-but-400 responses would pass.

### Weak assertions (risk of passing vacuously)

7. The filter tests use `for (const customer of body.customers)` with no
   `expect(body.customers.length).toBeGreaterThan(0)`. If a filter returned an empty array (e.g. a
   regression, or the real `?page=2&size=Small` case which yields `count: 0`), the loop asserts
   nothing and the test still passes.

### Edge cases / potential product bugs worth pinning down

8. **Fractional-value inconsistency** — `limit=0.5` → **400**, but `page=1.5` → **200** (echoes
   `currentPage: 1.5`). The existing negative tests only cover `[0, -1, 'abc']`; fractional `page`
   slips through. This asymmetry looks like a real bug — a test would document/catch it.
9. **Page beyond `totalPages`** — `page=999` → **200** with empty `customers` but `currentPage: 999`
   (greater than `totalPages: 5`). Untested; arguably should be pinned so behavior doesn't drift.
10. **Empty param values** — `?page=`, `?limit=` → 400; `?size=`, `?industry=` → 400. Not covered by
    the `'abc'` cases.
11. **`limit` above total** — `limit=1000` returns all 50 with `totalPages: 1` (no max-limit cap).
    Upper bound untested.
12. **`content-type` header** — never asserted to be `application/json`.

## Highest-value additions

A short list to act on first:

- **(6)** assert error messages
- **(2)** cover the multi-word sizes / other industries
- **(1)** the `All` value
- **(8)** the fractional-`page` inconsistency
- **(7)** guard the filter loops against vacuous passes
