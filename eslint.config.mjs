import studio from '@sanity/eslint-config-studio'

export default [
  // Generert av `sanity blueprints deploy` — ikke vår kode.
  {ignores: ['functions/*/.build/**', 'dist/**']},
  ...studio,
  {
    // Dokument-handlinger er komponenter Sanity kaller i en React-kontekst, så
    // `useClient` er lovlig her. Regelen kjenner bare ikke igjen mønsteret,
    // siden navnet verken starter med stor bokstav eller «use».
    files: ['studio/*Action.tsx'],
    rules: {'react-hooks/rules-of-hooks': 'off'},
  },
]
