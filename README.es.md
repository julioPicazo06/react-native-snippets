# React Native Snippet Lab

English documentation: [README.md](./README.md)

`React Native Snippet Lab` es una extension para Visual Studio Code enfocada en acelerar el trabajo diario con React Native.

Reune dos cosas que normalmente vienen separadas:

- snippets utiles para componentes, pantallas, navegacion, hooks, formularios y listas
- autocompletado con aliases cortos para estilos de React Native como `bg`, `c`, `px`, `py`, `ai` y `jc`

En lugar de traer snippets demasiado genericos, esta extension busca resolver escenarios reales de app y reducir la cantidad de codigo repetitivo al crear pantallas, formularios, listas y estructuras de navegacion.

Esta pensada tanto para equipos como para desarrolladores individuales que quieren generar estructura mas rapido sin perder control sobre nombres, estilos o ergonomia en TypeScript.

## Que Incluye

- Snippets para `javascript`, `javascriptreact`, `typescript` y `typescriptreact`
- Componentes y layouts base de React Native
- Snippets para React Navigation
- Hooks comunes de pantalla y logica reutilizable
- Formularios controlados y patrones con `react-hook-form`
- Flujos reales de listas con `FlatList`, `SectionList`, busqueda y estados vacios
- Aliases de estilos para escribir mas rapido dentro de objetos de estilo de React Native
- Sugerencias contextuales para que los aliases solo aparezcan dentro de props de estilo como `style`, `contentContainerStyle`, estilos inline dentro de arrays o bloques de `StyleSheet.create({})`
- Autocompletado de `styles.algo` dentro de props de estilo, con creacion automatica de la regla si todavia no existe
- Limpieza opcional de reglas vacias sin uso dentro de `StyleSheet.create`
- Acciones para extraer estilos inline a `StyleSheet.create`
- Una accion para agregar imports faltantes de React Native

## Aliases de Estilos Incluidos

Estos aliases expanden propiedades comunes de React Native y solo aparecen en contextos de estilo como `style={{}}`, `contentContainerStyle={{}}`, `style={[styles.base, { ... }]}` o reglas internas de `StyleSheet.create({})`:

- `bg` -> `backgroundColor`
- `c` -> `color`
- `p` -> `padding`
- `px` -> `paddingHorizontal`
- `py` -> `paddingVertical`
- `m` -> `margin`
- `mt` -> `marginTop`
- `mb` -> `marginBottom`
- `mx` -> `marginHorizontal`
- `my` -> `marginVertical`
- `br` -> `borderRadius`
- `fs` -> `fontSize`
- `fw` -> `fontWeight`
- `jc` -> `justifyContent`
- `ai` -> `alignItems`
- `fd` -> `flexDirection`
- `w` -> `width`
- `h` -> `height`

Tambien existen aliases con valor listo para casos muy frecuentes:

- `ai-c` -> `alignItems: 'center'`
- `ai-fs` -> `alignItems: 'flex-start'`
- `ai-fe` -> `alignItems: 'flex-end'`
- `d-f` -> `display: 'flex'`
- `d-n` -> `display: 'none'`
- `fd-c` -> `flexDirection: 'column'`
- `fd-r` -> `flexDirection: 'row'`
- `jc-c` -> `justifyContent: 'center'`
- `jc-fs` -> `justifyContent: 'flex-start'`
- `jc-fe` -> `justifyContent: 'flex-end'`
- `jc-sa` -> `justifyContent: 'space-around'`
- `jc-sb` -> `justifyContent: 'space-between'`
- `jc-se` -> `justifyContent: 'space-evenly'`
- `ov-h` -> `overflow: 'hidden'`
- `ov-s` -> `overflow: 'scroll'`
- `pos-a` -> `position: 'absolute'`
- `pos-r` -> `position: 'relative'`
- `ta-c` -> `textAlign: 'center'`
- `ta-l` -> `textAlign: 'left'`
- `ta-r` -> `textAlign: 'right'`
- `tt-c` -> `textTransform: 'capitalize'`
- `tt-l` -> `textTransform: 'lowercase'`
- `tt-u` -> `textTransform: 'uppercase'`

Ejemplo: si escribes `bg` y aceptas la sugerencia, la extension inserta algo como:

```js
backgroundColor: ,
```

Lo mismo aplica para otros aliases:

```js
paddingHorizontal: ,
justifyContent: ,
alignItems: ,
```

Y en los aliases con valor, la insercion ya sale completa:

```js
justifyContent: 'space-between',
flexDirection: 'row',
position: 'absolute',
```

## Referencias `styles.algo`

Cuando estas escribiendo dentro de un prop como `style={}` o `style={[...]}`, la extension tambien puede ayudarte a insertar referencias a `styles`.

Ejemplo:

```tsx
<View style={card} />
```

Si escribes `card` dentro de `style={}` y aceptas la sugerencia, la extension puede convertirlo en:

```tsx
<View style={styles.card} />
```

Y si el archivo ya tiene un bloque:

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

la extension agrega automaticamente la regla faltante:

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {},
});
```

Esto tambien funciona al escribir dentro de arreglos como:

```tsx
<View style={[styles.container, card]} />
```

para convertir `card` en `styles.card` y crear la regla vacia en `StyleSheet.create` cuando haga falta.

Si despues desaparece la referencia y la regla sigue vacia en formato compacto como `card: {},`, la extension puede limpiarla automaticamente. Ese comportamiento se puede activar o desactivar con `reactNativeSnippetLab.cleanupUnusedEmptyStyles`.

Si el archivo todavia no tiene ningun `StyleSheet.create(...)`, la extension ahora puede crear todo el bloque desde cero y agregar `StyleSheet` al import de `react-native` si hace falta.

Ejemplo de salida:

```tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Card() {
  return <View style={styles.card} />;
}

const styles = StyleSheet.create({
  card: {},
});
```

## Acciones de Productividad

La extension incluye dos acciones utiles desde el menu contextual, command palette o code actions.

### Extraer Inline Style a `StyleSheet`

Si tienes algo como:

```tsx
<View style={{ padding: 16, marginTop: 12 }} />
```

puedes usar `Extraer Inline Style a StyleSheet` para convertirlo en:

```tsx
<View style={styles.container} />

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 12,
  },
});
```

Tambien funciona en props que terminan en `Style`, por ejemplo `contentContainerStyle={{ ... }}`, `headerStyle={{ ... }}` o `iconStyle={{ ... }}`.

La primera version esta pensada para objetos inline directos como `style={{ ... }}`. Todavia no intenta extraer arreglos como `style={[base, { ... }]}` ni expresiones mas complejas.

### Agregar Imports Faltantes de React Native

La accion `Agregar Imports Faltantes de React Native` revisa identificadores conocidos usados en el archivo y agrega imports faltantes para casos comunes como:

- `View`
- `Text`
- `Pressable`
- `TextInput`
- `ScrollView`
- `FlatList`
- `SectionList`
- `Image`
- `Modal`
- `AppState`
- `useWindowDimensions`
- `SafeAreaView`

En `SafeAreaView`, la accion importa desde `react-native-safe-area-context`.

Si un simbolo conocido de React Native ya quedo importado por error desde un modulo incorrecto, ese mismo flujo de imports ahora intenta moverlo a su fuente canonica en lugar de dejar imports en conflicto.

## Handlers de Eventos

Dentro de props como `onPress={}`, `onChangeText={}` u otras props que empiezan con `on`, la extension puede ayudarte a generar handlers del componente.

Tambien reconoce callbacks especiales de listas y secciones como:

- `renderItem`
- `keyExtractor`
- `ListEmptyComponent`
- `ListHeaderComponent`
- `ListFooterComponent`
- `ItemSeparatorComponent`
- `renderSectionHeader`
- `renderSectionFooter`

Ejemplo:

```tsx
<Pressable onPress={handleNavigateToPruebitas} />
```

Si `handleNavigateToPruebitas` todavia no existe, la extension puede insertar la referencia y crear automaticamente:

```tsx

const handleNavigateToPruebitas = () => {
  
};
```

antes del `return` del componente, dejando una linea en blanco entre el helper y el bloque JSX.

En callbacks especiales intenta crear una firma mas util. Por ejemplo:

- `onChangeText` -> `const handleChange = (value) => {}`
- `renderItem` -> `const renderItem = ({ item, index }) => { return null; }`
- `keyExtractor` -> `const keyExtractor = (item, index) => { return item.id?.toString() ?? String(index); }`

Props de color como `placeholderTextColor`, `selectionColor`, `underlineColorAndroid`, `thumbTintColor` y `tintColor` tambien reciben sugerencias rapidas de valores como `#hex`, `rgba` o `transparent`.

## Sincronizacion de `type` en TypeScript

En archivos `ts` y `tsx`, la extension puede inferir un alias `type` a partir de constantes tipadas usando acciones explicitas.

Tambien puedes usar el menu contextual del editor:

1. Haz click derecho dentro de un objeto o array asignado a un `const`
2. Elige `Tipar Objeto`
3. La extension sugiere un nombre de `type`
4. Crea el alias y agrega el tipado a la constante

Ejemplo:

```tsx
type Transaction = {
  id: string;
};

const transactions: Transaction[] = [
  {
    id: '1',
    title: 'Pago nomina',
    amount: '+$28,000',
  },
];
```

Al detectar nuevas propiedades en los objetos del arreglo, la extension puede ofrecer una accion para completar el `type`:

```tsx
type Transaction = {
  id: string;
  title: string;
  amount: string;
};
```

Tambien funciona con:

- `const item: Transaction = { ... }`
- `const items: Transaction[] = [ ... ]`
- `type Transaction = {}` cuando ya existe una constante tipada con `Transaction` o `Transaction[]`

Esta primera version esta pensada para inferencias simples y utiles:

- strings -> `string`
- numeros -> `number`
- booleanos -> `boolean`
- arrays -> `unknown[]`
- objetos -> `Record<string, unknown>`
- campos como `type`, `status`, `variant`, `kind` o `mode` pueden inferirse como union de literales si detecta pocos valores distintos

El autosync sigue existiendo como opcion en `reactNativeSnippetLab.enableTypeSync`, pero ahora viene apagado por defecto para que el flujo principal sea mas controlado y menos invasivo.

## Catalogo de Snippets

Para una vista mas operativa de todos los prefijos disponibles y una guia rapida de prueba, revisa `SNIPPETS_CATALOG.md`.

Para QA manual orientado a release, usa `TESTING.md`.

Para notas de release y cambios publicados, usa `CHANGELOG.md`.

### Componentes y Layout

- `rnfc`
- `rnconst`
- `rnexportconst`
- `rnscreen`
- `rnview`
- `rntext`
- `rnpress`
- `rninput`
- `rnscroll`
- `rnsafe`
- `rnlist`
- `rnimage`
- `rnmodal`
- `rnstyle`

### Listas y Estados de UI

- `rnitem`
- `rnlistitem`
- `rnempty`
- `rnloading`
- `rnerror`
- `rnskeleton`
- `rnlistheader`
- `rnsearchheader`
- `rnsectionheader`
- `rnlistempty`
- `rnrefresh`
- `rnflat`
- `rnsearchlist`
- `rnsection`

Los snippets de componentes y pantallas toman por defecto el nombre del archivo como base del componente y lo dejan editable. Por ejemplo, en un archivo `user-profile.tsx` el nombre inicial sugerido sera `UserProfile`.

Los prefijos `rnview`, `rntext`, `rnpress`, `rninput`, `rnscroll`, `rnsafe`, `rnimage`, `rnmodal`, `rnitem`, `rnlistitem`, `rnempty`, `rnloading`, `rnerror`, `rnskeleton`, `rnlistheader`, `rnsearchheader`, `rnsectionheader`, `rnlistempty` y `rnrefresh` funcionan como snippets inteligentes: insertan el JSX, agregan imports faltantes, crean reglas faltantes dentro de `StyleSheet.create` cuando hace falta y ayudan a mantener enlazado el nombre entre `styles.algo` y la key del stylesheet mientras lo editas. Si una regla base como `container` o `text` ya existe, el snippet intenta usar un nombre nuevo en lugar de pisar la regla anterior. En snippets con varias reglas como `rnpress`, la regla principal ahora se selecciona automaticamente despues de insertarlo para que el renombre se sienta mas cercano al flujo de los snippets de una sola regla. `rnpress` tambien crea automaticamente un helper `handlePress` cuando el componente actual todavia no define uno. `rnlistitem` es el alias mas claro para el comportamiento anterior de `rnitem`. `rnlistempty` ahora crea `ListEmptyComponent={renderListEmpty}` y un helper en lugar de inyectar un bloque grande inline. Estos snippets inteligentes de JSX estan pensados para usarse dentro de un componente, no en el tope de un archivo vacio.

Los aliases de estilos y las referencias `styles.algo` tambien funcionan en props que terminan en `Style`, no solo en `style`. Eso incluye casos como `contentContainerStyle`, `labelStyle`, `containerStyle`, `headerStyle`, `footerStyle`, `iconStyle`, `inputStyle`, `wrapperStyle`, `buttonStyle`, `titleStyle` o `subtitleStyle`, para que componentes como `ScrollView` y muchas librerias de UI sigan el mismo flujo de autocompletado.

La opcion `reactNativeSnippetLab.enableStyleAliases` solo controla aliases cortos como `bg`, `px`, `jc` o `ai`. Los snippets inteligentes, referencias `styles.algo`, handlers y otras ayudas contextuales siguen funcionando aunque esa opcion este apagada.

Ejemplo de `rnfc`:

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ComponentName() {
  return (
    <View style={styles.container}>
      <Text>ComponentName</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

Ejemplo de `rnconst` en JavaScript:

```jsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ComponentName = (props) => {
  return (
    <View style={styles.container}>
      <Text>ComponentName</Text>
    </View>
  );
};

export default ComponentName;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

Ejemplo de `rnconst` en TypeScript:

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ComponentNameProps = {
  title: string;
};

const ComponentName = ({ title }: ComponentNameProps) => {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

export default ComponentName;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

Ejemplo de `rnexportconst`:

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ComponentNameProps = {
  title: string;
};

export const ComponentName = ({ title }: ComponentNameProps) => {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

Ejemplo de `rnscreen`:

```tsx
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScreenName() {
  return (
    <SafeAreaView style={styles.container}>
      <Text>ScreenName</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

Ejemplo de `rnpress`:

```tsx
<Pressable style={styles.button} onPress={handlePress}>
  <Text style={styles.buttonText}>Press me</Text>
</Pressable>
```

### Hooks

- `rnstate`
- `rneffect`
- `rnref`
- `rnhook`
- `rndim`
- `rnappstate`
- `rnfocus`

Ejemplo de `rnstate`:

```tsx
const [value, setValue] = React.useState(null);
```

Ejemplo de `rnhook`:

```tsx
import React from 'react';

export function useFeatureName() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const run = async () => {
    try {
      setLoading(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    run,
  };
}
```

Ejemplo de `rnfocus`:

```tsx
useFocusEffect(
  React.useCallback(() => {
    let active = true;

    const run = async () => {
    };

    run();

    return () => {
      active = false;
    };
  }, [])
);
```

### Navegacion

- `rnstack`
- `rntabs`
- `rnnav`
- `rnroute`
- `rnnavto`

Ejemplo de `rnstack`:

```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function HomeScreen() {
  return null;
}

function DetailsScreen() {
  return null;
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

Ejemplo de `rnnavto`:

```tsx
navigation.navigate('ScreenName', {});
```

### Formularios

- `rnform`
- `rncontroller`

Ejemplo de `rnform`:

```tsx
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function FormScreen() {
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Name"
        value={form.name}
        onChangeText={(value) => handleChange('name', value)}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={form.email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(value) => handleChange('email', value)}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={form.password}
        secureTextEntry
        onChangeText={(value) => handleChange('password', value)}
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </Pressable>
    </View>
  );
}
```

Ejemplo de `rncontroller`:

```tsx
<Controller
  control={control}
  name="fieldName"
  rules={{
    required: 'This field is required',
  }}
  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
    <>
      <TextInput
        onBlur={onBlur}
        onChangeText={onChange}
        value={value}
        placeholder="Type here"
        style={styles.input}
      />
      {error ? <Text style={styles.errorText}>{error.message}</Text> : null}
    </>
  )}
/>
```

### Listas

- `rnflat`
- `rnsearchlist`
- `rnsection`
- `rnitem`
- `rnlistitem`

Ejemplo de `rnflat`:

```tsx
const [data, setData] = React.useState([]);
const [loading, setLoading] = React.useState(false);
const [refreshing, setRefreshing] = React.useState(false);

const fetchData = async () => {
  try {
    setLoading(true);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

React.useEffect(() => {
  fetchData();
}, []);

<FlatList
  data={data}
  keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
  refreshing={refreshing}
  onRefresh={() => {
    setRefreshing(true);
    fetchData();
  }}
  ListEmptyComponent={!loading ? <Text>No items found</Text> : null}
  renderItem={({ item }) => (
    <View style={styles.itemContainer}>
      <Text>{item.title}</Text>
    </View>
  )}
/>
```

Ejemplo de `rnsearchlist`:

```tsx
const [query, setQuery] = React.useState('');
const [data] = React.useState([]);

const filteredData = data.filter((item) =>
  item.title.toLowerCase().includes(query.trim().toLowerCase())
);

<View style={styles.container}>
  <TextInput
    value={query}
    onChangeText={setQuery}
    placeholder="Search"
    style={styles.searchInput}
  />
  <FlatList
    data={filteredData}
    keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
    renderItem={({ item }) => (
      <View style={styles.itemContainer}>
        <Text>{item.title}</Text>
      </View>
    )}
  />
</View>
```

### TypeScript

- `rnts`

Ejemplo de `rnts`:

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ComponentNameProps = {
  title: string;
};

export default function ComponentName({ title }: ComponentNameProps) {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

## Como Probar la Extension

1. Abre esta carpeta en Visual Studio Code.
2. Presiona `F5` para abrir una ventana de `Extension Development Host`.
3. Dentro de esa nueva ventana abre un archivo `.js`, `.jsx`, `.ts` o `.tsx`.
4. Escribe un prefijo como `rnfc`, `rnstack`, `rnform` o `rnflat`.
5. Acepta el snippet y navega entre placeholders con `Tab`.
6. Dentro de un objeto de estilos prueba aliases como `bg`, `px`, `ai` o `jc`.

## Git Hooks

El repositorio usa `husky` para validar mensajes de commit con el formato:

```text
type(scope): description
```

Ejemplos validos:

- `feat(list): add smart empty state snippets`
- `fix(style): avoid duplicate stylesheet placeholders`
- `docs(readme): document commit hooks`

La validacion corre en `commit-msg` y sigue la convencion descrita en `CONTRIBUTING.md`.

## Estado del Proyecto

Este repositorio ya tiene un MVP funcional con:

- Una extension base de VS Code
- Snippets iniciales para flujos reales de React Native
- Autocompletado de aliases de estilos
- Configuracion minima para probar la extension localmente

## Siguientes Pasos Sugeridos

- Agregar aliases personalizados desde la configuracion de VS Code
- Agregar snippets para almacenamiento, consumo de APIs y manejo de errores
- Crear variantes TypeScript mas estrictas para navegacion y props
- Empaquetar la extension como `.vsix`
