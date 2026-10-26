# Query Builder

A React + TypeScript query builder. Users build nested AND/OR rule groups; on submit the query is shown as JSON and sent to `/api/save-rules`.

## Running the project

Requires Node 22+.

```sh
npm install
npm run dev              # http://localhost:5173

npm test                 # unit and component tests
npm run test:coverage    # tests with coverage report
npx playwright install chromium   # once, before the e2e tests
npm run test:e2e         # end-to-end tests
```

No backend came with the exercise, so `mock-server/saveRules.ts` mocks `POST /api/save-rules` in the dev server.

## How it's built

The query is held as a tree in a reducer and converted to the backend schema on submit.

| Module                   | Responsibility                                |
| ------------------------ | --------------------------------------------- |
| `src/types.ts`           | Backend schema types                          |
| `src/constants.ts`       | Operations per field type, currencies, states |
| `src/fields.ts`          | Field registry: label, default value, widget  |
| `src/widgets/`           | Value inputs: text, integer, money, select    |
| `src/queryReducer.ts`    | Query tree state and actions                  |
| `src/payload.ts`         | Converts the tree to the backend schema       |
| `src/ConditionGroup.tsx` | Renders a group and its children, recursively |
| `src/RuleOptions.tsx`    | Renders one rule: field, operation, value     |
| `src/api.ts`             | Sends the query to the backend                |
| `src/App.tsx`            | The form, save status and JSON output         |

To add a field, add its value type to `FieldValueMap` (`types.ts`), its type to `FIELD_TYPES` (`constants.ts`) and its config to `FIELDS` (`fields.ts`). TypeScript flags any missing step.
