# Snippets Catalog

Catalogo rapido de prefijos disponibles en `React Native Snippet Lab`.

## Snippets inteligentes

Estos prefijos insertan JSX, agregan imports faltantes cuando aplica y pueden crear reglas en `StyleSheet.create`.

### Componentes base

- `rnview`
- `rntext`
- `rnpress`
- `rninput`
- `rnscroll`
- `rnsafe`
- `rnimage`
- `rnmodal`

### Listas y estados

- `rnitem`
- `rnempty`
- `rnloading`
- `rnerror`
- `rnskeleton`
- `rnlistheader`
- `rnsearchheader`
- `rnsectionheader`
- `rnlistempty`
- `rnrefresh`

## Snippets comunes

Disponibles en `javascript`, `javascriptreact`, `typescript` y `typescriptreact`.

### Componentes y layout

- `rnfc`
- `rnscreen`
- `rnlist`
- `rnstyle`

### Hooks

- `rnstate`
- `rneffect`
- `rnref`
- `rnhook`
- `rndim`
- `rnappstate`

### Navegacion

- `rnstack`
- `rntabs`
- `rnnavto`
- `rnnav`
- `rnroute`
- `rnfocus`

### Formularios

- `rnform`
- `rncontroller`

### Listas

- `rnflat`
- `rnsearchlist`
- `rnsection`

## Snippets solo JavaScript

- `rnconst`
- `rnexportconst`

## Snippets solo TypeScript

- `rnconst`
- `rnexportconst`
- `rnts`

## Escenario real para probar

Crea un archivo `ProductsScreen.tsx` y prueba este flujo:

1. Escribe `rnconst` para crear la pantalla base.
2. Dentro del componente prueba `rnsafe`.
3. Dentro de `SafeAreaView` prueba `rnsearchheader`.
4. Debajo prueba `rnloading`.
5. Sustituye el loading por `rnempty`.
6. Dentro de un `FlatList` prueba `rnlistempty`.
7. Para el item visual prueba `rnitem`.
8. Si necesitas `RefreshControl`, prueba `rnrefresh`.

## Ejemplo de playground

```tsx
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProductsScreen = () => {
  const [query, setQuery] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* prueba rnsearchheader aqui */}

      <FlatList
        data={[]}
        keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
        /* prueba rnlistempty aqui */
        /* prueba rnrefresh aqui */
        renderItem={({ item }) => (
          /* prueba rnitem aqui */
          null
        )}
      />
    </SafeAreaView>
  );
};

export default ProductsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
```

## Sugerencia de QA rapida

Al probar cada snippet, revisa esto:

- si inserta el JSX correcto
- si agrega imports faltantes
- si crea reglas en `StyleSheet.create` cuando corresponde
- si el nombre del style queda enlazado entre el JSX y el stylesheet
- si no pisa una regla ya existente
