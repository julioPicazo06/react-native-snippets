# React Native Snippet Lab

Spanish documentation: [README.es.md](./README.es.md)

`React Native Snippet Lab` is a Visual Studio Code extension built to make day-to-day React Native development faster and more consistent.

It brings together two things that are usually split apart:

- practical snippets for components, screens, navigation, hooks, forms, and lists
- contextual style aliases for React Native properties such as `bg`, `c`, `px`, `py`, `ai`, and `jc`

Instead of shipping generic boilerplate, the extension focuses on real app flows and helps reduce repetitive code when building screens, forms, lists, and navigation structures.

It is designed for teams and solo developers who want faster scaffolding without losing control over naming, styling, or TypeScript ergonomics.

## What It Includes

- Snippets for `javascript`, `javascriptreact`, `typescript`, and `typescriptreact`
- Base React Native components and layouts
- React Navigation snippets
- Common screen hooks and reusable logic patterns
- Controlled forms and `react-hook-form` patterns
- Real list workflows with `FlatList`, `SectionList`, search, and empty states
- Style aliases for writing faster inside React Native style objects
- Context-aware suggestions so aliases only appear inside style props such as `style`, `contentContainerStyle`, inline style objects inside arrays, or `StyleSheet.create({})`
- `styles.something` autocompletion inside style props, with automatic rule creation when the style does not exist yet
- Optional cleanup for unused empty rules inside `StyleSheet.create`
- Actions to extract inline styles into `StyleSheet.create`
- An action to add missing React Native imports

## Included Style Aliases

These aliases expand common React Native properties and only appear in style contexts such as `style={{}}`, `contentContainerStyle={{}}`, `style={[styles.base, { ... }]}`, or nested rules inside `StyleSheet.create({})`:

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

There are also value-ready aliases for very common cases:

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

Example: if you type `bg` and accept the suggestion, the extension inserts something like:

```js
backgroundColor: ,
```

The same applies to other aliases:

```js
paddingHorizontal: ,
justifyContent: ,
alignItems: ,
```

And value-ready aliases insert the full declaration:

```js
justifyContent: 'space-between',
flexDirection: 'row',
position: 'absolute',
```

## `styles.something` References

When you are typing inside a prop such as `style={}` or `style={[...]}`, the extension can also help you insert `styles` references.

Example:

```tsx
<View style={card} />
```

If you type `card` inside `style={}` and accept the suggestion, the extension can turn it into:

```tsx
<View style={styles.card} />
```

And if the file already contains:

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

the extension automatically adds the missing rule:

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {},
});
```

This also works inside arrays such as:

```tsx
<View style={[styles.container, card]} />
```

to convert `card` into `styles.card` and create the empty rule in `StyleSheet.create` when needed.

If the reference later disappears and the rule is still empty in compact form such as `card: {},`, the extension can clean it up automatically. That behavior can be enabled or disabled with `reactNativeSnippetLab.cleanupUnusedEmptyStyles`.

If the file does not contain any `StyleSheet.create(...)` yet, the extension can now create the whole block from scratch and add `StyleSheet` to the `react-native` import when needed.

Example output:

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

## Productivity Actions

The extension includes two useful actions from the context menu, command palette, or code actions.

### Extract Inline Style to `StyleSheet`

If you have something like:

```tsx
<View style={{ padding: 16, marginTop: 12 }} />
```

you can use `Extract Inline Style to StyleSheet` to turn it into:

```tsx
<View style={styles.container} />

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 12,
  },
});
```

It also works on props that end in `Style`, such as `contentContainerStyle={{ ... }}`, `headerStyle={{ ... }}`, or `iconStyle={{ ... }}`.

The first version focuses on direct inline objects like `style={{ ... }}`. It does not yet try to extract arrays like `style={[base, { ... }]}` or more complex expressions.

### Add Missing React Native Imports

The `Add Missing React Native Imports` action scans known identifiers used in the file and adds missing imports for common cases such as:

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

For `SafeAreaView`, the action imports from `react-native-safe-area-context`.

When a known React Native symbol has already been imported from the wrong module by mistake, the same import flow now tries to move it back to its canonical source instead of leaving conflicting imports behind.

## Event Handlers

Inside props such as `onPress={}`, `onChangeText={}`, or other props that start with `on`, the extension can help generate component handlers.

It also recognizes special list and section callbacks such as:

- `renderItem`
- `keyExtractor`
- `ListEmptyComponent`
- `ListHeaderComponent`
- `ListFooterComponent`
- `ItemSeparatorComponent`
- `renderSectionHeader`
- `renderSectionFooter`

Example:

```tsx
<Pressable onPress={handleNavigateToPruebitas} />
```

If `handleNavigateToPruebitas` does not exist yet, the extension can insert the reference and automatically create:

```tsx

const handleNavigateToPruebitas = () => {
  
};
```

before the component `return`, keeping an empty line between the helper and the JSX block.

For special callbacks it tries to create a more useful signature. For example:

- `onChangeText` -> `const handleChange = (value) => {}`
- `renderItem` -> `const renderItem = ({ item, index }) => { return null; }`
- `keyExtractor` -> `const keyExtractor = (item, index) => { return item.id?.toString() ?? String(index); }`

Color props such as `placeholderTextColor`, `selectionColor`, `underlineColorAndroid`, `thumbTintColor`, and `tintColor` also get quick value suggestions like `#hex`, `rgba`, or `transparent`.

## Type Synchronization in TypeScript

In `ts` and `tsx` files, the extension can infer a `type` alias from typed constants using explicit actions.

You can also use the editor context menu:

1. Right-click inside an object or array assigned to a `const`
2. Choose `Type Object`
3. The extension suggests a `type` name
4. It creates the alias and adds the type annotation to the constant

Example:

```tsx
type Transaction = {
  id: string;
};

const transactions: Transaction[] = [
  {
    id: '1',
    title: 'Payroll',
    amount: '+$28,000',
  },
];
```

When it detects new properties in the array objects, the extension can offer an action to complete the `type`:

```tsx
type Transaction = {
  id: string;
  title: string;
  amount: string;
};
```

It also works with:

- `const item: Transaction = { ... }`
- `const items: Transaction[] = [ ... ]`
- `type Transaction = {}` when a typed constant using `Transaction` or `Transaction[]` already exists

This first version is intentionally focused on simple and useful inference:

- strings -> `string`
- numbers -> `number`
- booleans -> `boolean`
- arrays -> `unknown[]`
- objects -> `Record<string, unknown>`
- fields such as `type`, `status`, `variant`, `kind`, or `mode` may become literal unions when only a few distinct values are detected

Autosync still exists as an option in `reactNativeSnippetLab.enableTypeSync`, but it is disabled by default so the main flow stays more controlled and less invasive.

## Snippet Catalog

For a more operational view of all available prefixes and a quick testing guide, check `SNIPPETS_CATALOG.md`.

For release-oriented manual QA, use `TESTING.md`.

For release notes and published changes, use `CHANGELOG.md`.

### Components and Layout

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

### Lists and UI States

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

Component and screen snippets use the current file name as the default component base name and leave it editable. For example, in a file named `user-profile.tsx`, the initial suggested name becomes `UserProfile`.

The prefixes `rnview`, `rntext`, `rnpress`, `rninput`, `rnscroll`, `rnsafe`, `rnimage`, `rnmodal`, `rnitem`, `rnlistitem`, `rnempty`, `rnloading`, `rnerror`, `rnskeleton`, `rnlistheader`, `rnsearchheader`, `rnsectionheader`, `rnlistempty`, and `rnrefresh` work as smart snippets: they insert JSX, add missing imports, create missing rules inside `StyleSheet.create` when needed, and help keep the rule name linked between `styles.something` and the stylesheet key while editing. If a base rule like `container` or `text` already exists, the snippet tries to use a new name instead of overwriting the previous one. In snippets with multiple style rules such as `rnpress`, the primary rule is now selected automatically after insertion so renaming stays closer to the single-rule snippet flow. `rnpress` also creates a `handlePress` helper automatically when the current component does not already define one. `rnlistitem` is the clearer alias for the old `rnitem` behavior. `rnlistempty` now creates `ListEmptyComponent={renderListEmpty}` and a helper instead of injecting a large inline JSX block. These smart JSX snippets are intended to be used inside a component, not at the top level of an empty file.

Style aliases and `styles` references also work in props ending in `Style`, not only `style`. That includes cases such as `contentContainerStyle`, `labelStyle`, `containerStyle`, `headerStyle`, `footerStyle`, `iconStyle`, `inputStyle`, `wrapperStyle`, `buttonStyle`, `titleStyle`, or `subtitleStyle`, so components like `ScrollView` and many UI libraries follow the same completion flow.

The `reactNativeSnippetLab.enableStyleAliases` setting only controls short aliases like `bg`, `px`, `jc`, or `ai`. Smart snippets, `styles.something` references, handlers, and other contextual helpers keep working even when that setting is disabled.

Example `rnfc` output:

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

Example `rnconst` in JavaScript:

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

Example `rnconst` in TypeScript:

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

Example `rnexportconst`:

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

Example `rnscreen`:

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

Example `rnpress`:

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

Example `rnstate`:

```tsx
const [value, setValue] = React.useState(null);
```

Example `rnhook`:

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

Example `rnfocus`:

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

### Navigation

- `rnstack`
- `rntabs`
- `rnnav`
- `rnroute`
- `rnnavto`

Example `rnstack`:

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

Example `rnnavto`:

```tsx
navigation.navigate('ScreenName', {});
```

### Forms

- `rnform`
- `rncontroller`

Example `rnform`:

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

Example `rncontroller`:

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

### Lists

- `rnflat`
- `rnsearchlist`
- `rnsection`
- `rnitem`
- `rnlistitem`

Example `rnflat`:

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

Example `rnsearchlist`:

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

Example `rnts`:

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

## How to Test the Extension

1. Open this folder in Visual Studio Code.
2. Press `F5` to open an `Extension Development Host` window.
3. Inside that new window, open a `.js`, `.jsx`, `.ts`, or `.tsx` file.
4. Type a prefix such as `rnfc`, `rnstack`, `rnform`, or `rnflat`.
5. Accept the snippet and move across placeholders with `Tab`.
6. Inside a style object, try aliases like `bg`, `px`, `ai`, or `jc`.

## Git Hooks

The repository uses `husky` to validate commit messages with this format:

```text
type(scope): description
```

Valid examples:

- `feat(list): add smart empty state snippets`
- `fix(style): avoid duplicate stylesheet placeholders`
- `docs(readme): document commit hooks`

Validation runs on `commit-msg` and follows the convention described in `CONTRIBUTING.md`.

## Project Status

The project already has a functional MVP with:

- A base VS Code extension
- Initial snippets for real React Native workflows
- Style alias autocompletion
- Minimal configuration to test the extension locally

## Suggested Next Steps

- Add custom aliases through VS Code configuration
- Add snippets for storage, API consumption, and error handling
- Create stricter TypeScript variants for navigation and props
- Package the extension as a `.vsix`
