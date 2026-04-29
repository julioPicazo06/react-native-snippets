# React Native Snippet Lab

`React Native Snippet Lab` es una extension para Visual Studio Code enfocada en acelerar el trabajo diario con React Native.

La idea del proyecto es combinar dos cosas que normalmente vienen separadas:

- Snippets utiles para componentes, pantallas, navegacion, hooks, formularios y listas
- Autocompletado con aliases cortos para estilos de React Native como `bg`, `c`, `px`, `py`, `ai` o `jc`

En lugar de traer snippets demasiado genericos, esta extension busca resolver escenarios reales de app y reducir la cantidad de codigo repetitivo al crear pantallas, formularios, listas y estructuras de navegacion.

## Que incluye

- Snippets para `javascript`, `javascriptreact`, `typescript` y `typescriptreact`
- Componentes y layouts base de React Native
- Snippets para React Navigation
- Hooks comunes de pantalla y logica reutilizable
- Formularios controlados y patrones con `react-hook-form`
- Listas reales con `FlatList`, `SectionList`, busqueda y estados vacios
- Aliases de estilos para escribir mas rapido dentro de objetos de estilo
- Sugerencias contextuales para que los aliases aparezcan solo dentro de props de estilo como `style`, `contentContainerStyle`, estilos inline dentro de arrays, o bloques de `StyleSheet.create({})`
- Autocompletado de referencias tipo `styles.algo` dentro de props `style`, con creacion automatica de la regla si todavia no existe

## Aliases de estilos incluidos

Estos aliases expanden propiedades comunes de React Native y ahora se muestran solo en contextos de estilos, por ejemplo dentro de `style={{}}`, `contentContainerStyle={{}}`, `style={[styles.base, { ... }]}` o reglas internas de `StyleSheet.create({})`:

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

## Referencias `styles.algo`

Cuando estes escribiendo dentro de un prop como `style={}` o `style={[...]}`, la extension tambien puede ayudarte a insertar referencias a `styles`.

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
  card: {
  },
});
```

Esto tambien funciona al escribir dentro de arreglos como:

```tsx
<View style={[styles.container, card]} />
```

para convertir `card` en `styles.card` y, si hace falta, crear la regla vacia en `StyleSheet.create`.

Si el archivo todavia no tiene ningun `StyleSheet.create(...)`, la extension ahora puede crear todo el bloque desde cero y agregar `StyleSheet` al import de `react-native` si hace falta.

Ejemplo de salida:

```tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Card() {
  return <View style={styles.card} />;
}

const styles = StyleSheet.create({
  card: {
  },
});
```

## Catalogo de snippets

### Componentes y layout

- `rnfc`
- `rnconst`
- `rnexportconst`
- `rnscreen`
- `rnview`
- `rntext`
- `rnpress`
- `rninput`
- `rnscroll`
- `rnlist`
- `rnimage`
- `rnmodal`
- `rnstyle`

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
import { SafeAreaView, StyleSheet, Text } from 'react-native';

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

## Como probar la extension

1. Abre esta carpeta en Visual Studio Code.
2. Presiona `F5` para abrir una ventana de `Extension Development Host`.
3. Dentro de esa nueva ventana abre un archivo `.js`, `.jsx`, `.ts` o `.tsx`.
4. Escribe un prefijo como `rnfc`, `rnstack`, `rnform` o `rnflat`.
5. Acepta el snippet y navega entre placeholders con `Tab`.
6. Dentro de un objeto de estilos prueba aliases como `bg`, `px`, `ai` o `jc`.

## En que estado va el proyecto

Este repo ya tiene un MVP funcional con:

- Extension base de VS Code
- Snippets iniciales para flujos reales de React Native
- Autocompletado de aliases de estilos
- Configuracion minima para probar la extension localmente

## Siguientes pasos sugeridos

- Restringir los aliases de estilos para que aparezcan solo en contextos de `style`
- Permitir aliases personalizados desde configuracion de VS Code
- Agregar snippets para almacenamiento, consumo de APIs y manejo de errores
- Crear versiones TypeScript mas estrictas para navegacion y props
- Empaquetar la extension como `.vsix`
