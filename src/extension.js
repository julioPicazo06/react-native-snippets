const vscode = require("vscode");
const typeSyncTimers = new Map();
const styleCleanupTimers = new Map();
const internalTypeSyncUpdates = new Set();

const STYLE_ALIASES = {
  ai: "alignItems",
  as: "alignSelf",
  b: "bottom",
  bc: "borderColor",
  bg: "backgroundColor",
  br: "borderRadius",
  bw: "borderWidth",
  c: "color",
  cg: "columnGap",
  d: "display",
  f: "flex",
  fd: "flexDirection",
  ff: "fontFamily",
  fg: "flexGrow",
  fs: "fontSize",
  fw: "fontWeight",
  g: "gap",
  h: "height",
  jc: "justifyContent",
  l: "left",
  lh: "lineHeight",
  ls: "letterSpacing",
  m: "margin",
  mb: "marginBottom",
  ml: "marginLeft",
  mr: "marginRight",
  mt: "marginTop",
  mx: "marginHorizontal",
  my: "marginVertical",
  op: "opacity",
  ov: "overflow",
  p: "padding",
  pb: "paddingBottom",
  pl: "paddingLeft",
  pos: "position",
  pr: "paddingRight",
  pt: "paddingTop",
  px: "paddingHorizontal",
  py: "paddingVertical",
  r: "right",
  rg: "rowGap",
  t: "top",
  ta: "textAlign",
  tt: "textTransform",
  w: "width",
  zi: "zIndex"
};

const STYLE_VALUE_ALIASES = {
  "ai-c": {
    propertyName: "alignItems",
    value: "'center'"
  },
  "ai-fs": {
    propertyName: "alignItems",
    value: "'flex-start'"
  },
  "ai-fe": {
    propertyName: "alignItems",
    value: "'flex-end'"
  },
  "d-f": {
    propertyName: "display",
    value: "'flex'"
  },
  "d-n": {
    propertyName: "display",
    value: "'none'"
  },
  "fd-c": {
    propertyName: "flexDirection",
    value: "'column'"
  },
  "fd-r": {
    propertyName: "flexDirection",
    value: "'row'"
  },
  "jc-c": {
    propertyName: "justifyContent",
    value: "'center'"
  },
  "jc-fe": {
    propertyName: "justifyContent",
    value: "'flex-end'"
  },
  "jc-fs": {
    propertyName: "justifyContent",
    value: "'flex-start'"
  },
  "jc-sa": {
    propertyName: "justifyContent",
    value: "'space-around'"
  },
  "jc-sb": {
    propertyName: "justifyContent",
    value: "'space-between'"
  },
  "jc-se": {
    propertyName: "justifyContent",
    value: "'space-evenly'"
  },
  "ov-h": {
    propertyName: "overflow",
    value: "'hidden'"
  },
  "ov-s": {
    propertyName: "overflow",
    value: "'scroll'"
  },
  "pos-a": {
    propertyName: "position",
    value: "'absolute'"
  },
  "pos-r": {
    propertyName: "position",
    value: "'relative'"
  },
  "ta-c": {
    propertyName: "textAlign",
    value: "'center'"
  },
  "ta-l": {
    propertyName: "textAlign",
    value: "'left'"
  },
  "ta-r": {
    propertyName: "textAlign",
    value: "'right'"
  },
  "tt-c": {
    propertyName: "textTransform",
    value: "'capitalize'"
  },
  "tt-l": {
    propertyName: "textTransform",
    value: "'lowercase'"
  },
  "tt-u": {
    propertyName: "textTransform",
    value: "'uppercase'"
  }
};

const JSX_STYLE_RULE_NAME_BY_TAG = {
  Image: "image",
  Modal: "modal",
  Pressable: "button",
  SafeAreaView: "safeArea",
  ScrollView: "content",
  Text: "text",
  TextInput: "input",
  View: "container"
};

const REACT_NATIVE_SYMBOL_SOURCES = {
  ActivityIndicator: "react-native",
  AppState: "react-native",
  FlatList: "react-native",
  Image: "react-native",
  KeyboardAvoidingView: "react-native",
  Modal: "react-native",
  Pressable: "react-native",
  RefreshControl: "react-native",
  SafeAreaView: "react-native-safe-area-context",
  ScrollView: "react-native",
  SectionList: "react-native",
  StyleSheet: "react-native",
  Text: "react-native",
  TextInput: "react-native",
  useWindowDimensions: "react-native",
  View: "react-native"
};

const STYLED_COMPONENT_SNIPPETS = {
  rnview: {
    detail: "Insert a View and create its style rule.",
    imports: [{ source: "react-native", names: ["View"] }],
    rulePlaceholders: [{ index: 1, name: "container" }],
    rules: ["container"],
    body: [
      "<View style={styles.${1:container}}>",
      "  ${0}",
      "</View>"
    ]
  },
  rntext: {
    detail: "Insert a Text and create its style rule.",
    imports: [{ source: "react-native", names: ["Text"] }],
    rulePlaceholders: [{ index: 1, name: "text" }],
    rules: ["text"],
    body: [
      "<Text style={styles.${1:text}}>${0:Label}</Text>"
    ]
  },
  rnpress: {
    detail: "Insert a Pressable and create its style rules.",
    imports: [{ source: "react-native", names: ["Pressable", "Text"] }],
    rulePlaceholders: [
      { index: 1, name: "button" },
      { index: 3, name: "buttonText" }
    ],
    handlerPlaceholders: [
      { index: 2, name: "handlePress", propName: "onPress" }
    ],
    rules: ["button", "buttonText"],
    body: [
      "<Pressable style={styles.${1:button}} onPress={${2:handlePress}}>",
      "  <Text style={styles.${3:buttonText}}>${0:Press me}</Text>",
      "</Pressable>"
    ]
  },
  rninput: {
    detail: "Insert a TextInput and create its style rule.",
    imports: [{ source: "react-native", names: ["TextInput"] }],
    rulePlaceholders: [{ index: 4, name: "input" }],
    rules: ["input"],
    body: [
      "<TextInput",
      "  value={${1:value}}",
      "  onChangeText={${2:setValue}}",
      "  placeholder=\"${3:Type here}\"",
      "  style={styles.${4:input}}",
      "/>"
    ]
  },
  rnscroll: {
    detail: "Insert a ScrollView and create its style rule.",
    imports: [{ source: "react-native", names: ["ScrollView"] }],
    rulePlaceholders: [{ index: 1, name: "content" }],
    rules: ["content"],
    body: [
      "<ScrollView contentContainerStyle={styles.${1:content}}>",
      "  ${0}",
      "</ScrollView>"
    ]
  },
  rnsafe: {
    detail: "Insert a SafeAreaView and create its style rule.",
    imports: [
      {
        source: "react-native-safe-area-context",
        names: ["SafeAreaView"]
      }
    ],
    rulePlaceholders: [{ index: 1, name: "safeArea" }],
    rules: ["safeArea"],
    body: [
      "<SafeAreaView style={styles.${1:safeArea}}>",
      "  ${0}",
      "</SafeAreaView>"
    ]
  },
  rnimage: {
    detail: "Insert an Image and create its style rule.",
    imports: [{ source: "react-native", names: ["Image"] }],
    rulePlaceholders: [{ index: 2, name: "image" }],
    rules: ["image"],
    body: [
      "<Image",
      "  source={{ uri: '${1:https://example.com/image.png}' }}",
      "  style={styles.${2:image}}",
      "/>"
    ]
  },
  rnmodal: {
    detail: "Insert a Modal and create its style rules.",
    imports: [{ source: "react-native", names: ["Modal", "View"] }],
    rulePlaceholders: [
      { index: 2, name: "overlay" },
      { index: 3, name: "modal" }
    ],
    rules: ["overlay", "modal"],
    body: [
      "<Modal visible={${1:isVisible}} transparent animationType=\"slide\">",
      "  <View style={styles.${2:overlay}}>",
      "    <View style={styles.${3:modal}}>",
      "      ${0}",
      "    </View>",
      "  </View>",
      "</Modal>"
    ]
  },
  rnitem: {
    detail: "Insert a list item and create its style rules.",
    imports: [{ source: "react-native", names: ["Pressable", "Text", "View"] }],
    rulePlaceholders: [
      { index: 1, name: "item" },
      { index: 3, name: "content" },
      { index: 4, name: "title" },
      { index: 6, name: "subtitle" }
    ],
    rules: ["item", "content", "title", "subtitle"],
    body: [
      "<Pressable style={styles.${1:item}} onPress={() => ${2}}> ",
      "  <View style={styles.${3:content}}>",
      "    <Text style={styles.${4:title}}>${5:Title}</Text>",
      "    <Text style={styles.${6:subtitle}}>${7:Subtitle}</Text>",
      "  </View>",
      "</Pressable>"
    ]
  },
  rnlistitem: {
    detail: "Insert a list item and create its style rules.",
    imports: [{ source: "react-native", names: ["Pressable", "Text", "View"] }],
    rulePlaceholders: [
      { index: 1, name: "item" },
      { index: 3, name: "content" },
      { index: 4, name: "title" },
      { index: 6, name: "subtitle" }
    ],
    rules: ["item", "content", "title", "subtitle"],
    body: [
      "<Pressable style={styles.${1:item}} onPress={() => ${2}}> ",
      "  <View style={styles.${3:content}}>",
      "    <Text style={styles.${4:title}}>${5:Title}</Text>",
      "    <Text style={styles.${6:subtitle}}>${7:Subtitle}</Text>",
      "  </View>",
      "</Pressable>"
    ]
  },
  rnempty: {
    detail: "Insert an empty state and create its style rules.",
    imports: [{ source: "react-native", names: ["Text", "View"] }],
    rulePlaceholders: [
      { index: 1, name: "emptyState" },
      { index: 2, name: "emptyTitle" },
      { index: 4, name: "emptySubtitle" }
    ],
    rules: ["emptyState", "emptyTitle", "emptySubtitle"],
    body: [
      "<View style={styles.${1:emptyState}}>",
      "  <Text style={styles.${2:emptyTitle}}>${3:No items found}</Text>",
      "  <Text style={styles.${4:emptySubtitle}}>${0:Try changing your filters or come back later.}</Text>",
      "</View>"
    ]
  },
  rnloading: {
    detail: "Insert a loading state and create its style rules.",
    imports: [
      {
        source: "react-native",
        names: ["ActivityIndicator", "Text", "View"]
      }
    ],
    rulePlaceholders: [
      { index: 2, name: "loadingState" },
      { index: 3, name: "loadingText" }
    ],
    rules: ["loadingState", "loadingText"],
    body: [
      "<View style={styles.${2:loadingState}}>",
      "  <ActivityIndicator size=\"${1:large}\" color=\"${4:#111827}\" />",
      "  <Text style={styles.${3:loadingText}}>${0:Loading...}</Text>",
      "</View>"
    ]
  },
  rnerror: {
    detail: "Insert an error state and create its style rules.",
    imports: [{ source: "react-native", names: ["Pressable", "Text", "View"] }],
    rulePlaceholders: [
      { index: 2, name: "errorState" },
      { index: 3, name: "errorTitle" },
      { index: 5, name: "errorMessage" },
      { index: 7, name: "retryButton" },
      { index: 8, name: "retryButtonText" }
    ],
    rules: ["errorState", "errorTitle", "errorMessage", "retryButton", "retryButtonText"],
    body: [
      "<View style={styles.${2:errorState}}>",
      "  <Text style={styles.${3:errorTitle}}>${4:Something went wrong}</Text>",
      "  <Text style={styles.${5:errorMessage}}>${6:Please try again in a moment.}</Text>",
      "  <Pressable style={styles.${7:retryButton}} onPress={${1:handleRetry}}>",
      "    <Text style={styles.${8:retryButtonText}}>${0:Try again}</Text>",
      "  </Pressable>",
      "</View>"
    ]
  },
  rnskeleton: {
    detail: "Insert a skeleton card and create its style rules.",
    imports: [{ source: "react-native", names: ["View"] }],
    rulePlaceholders: [
      { index: 1, name: "skeletonCard" },
      { index: 2, name: "skeletonLineLg" },
      { index: 3, name: "skeletonLineMd" },
      { index: 4, name: "skeletonLineSm" }
    ],
    rules: ["skeletonCard", "skeletonLineLg", "skeletonLineMd", "skeletonLineSm"],
    body: [
      "<View style={styles.${1:skeletonCard}}>",
      "  <View style={styles.${2:skeletonLineLg}} />",
      "  <View style={styles.${3:skeletonLineMd}} />",
      "  <View style={styles.${4:skeletonLineSm}} />",
      "</View>"
    ]
  },
  rnlistheader: {
    detail: "Insert a list header and create its style rules.",
    imports: [{ source: "react-native", names: ["Text", "View"] }],
    rulePlaceholders: [
      { index: 1, name: "listHeader" },
      { index: 2, name: "listTitle" },
      { index: 4, name: "listSubtitle" }
    ],
    rules: ["listHeader", "listTitle", "listSubtitle"],
    body: [
      "<View style={styles.${1:listHeader}}>",
      "  <Text style={styles.${2:listTitle}}>${3:Section title}</Text>",
      "  <Text style={styles.${4:listSubtitle}}>${0:Helpful supporting copy}</Text>",
      "</View>"
    ]
  },
  rnrefresh: {
    detail: "Insert a RefreshControl scaffold.",
    imports: [{ source: "react-native", names: ["RefreshControl"] }],
    rules: [],
    body: [
      "<RefreshControl",
      "  refreshing={${1:refreshing}}",
      "  onRefresh={${2:handleRefresh}}",
      "/>"
    ]
  },
  rnsearchheader: {
    detail: "Insert a search header and create its style rules.",
    imports: [{ source: "react-native", names: ["TextInput", "View"] }],
    rulePlaceholders: [
      { index: 1, name: "searchHeader" },
      { index: 4, name: "searchInput" }
    ],
    rules: ["searchHeader", "searchInput"],
    body: [
      "<View style={styles.${1:searchHeader}}>",
      "  <TextInput",
      "    value={${2:query}}",
      "    onChangeText={${3:setQuery}}",
      "    placeholder=\"${5:Search}\"",
      "    style={styles.${4:searchInput}}",
      "  />",
      "</View>"
    ]
  },
  rnsectionheader: {
    detail: "Insert a section header and create its style rules.",
    imports: [{ source: "react-native", names: ["Text", "View"] }],
    rulePlaceholders: [
      { index: 1, name: "sectionHeader" },
      { index: 2, name: "sectionTitle" },
      { index: 4, name: "sectionCaption" }
    ],
    rules: ["sectionHeader", "sectionTitle", "sectionCaption"],
    body: [
      "<View style={styles.${1:sectionHeader}}>",
      "  <Text style={styles.${2:sectionTitle}}>${3:Section title}</Text>",
      "  <Text style={styles.${4:sectionCaption}}>${0:Optional supporting copy}</Text>",
      "</View>"
    ]
  },
  rnlistempty: {
    detail: "Insert a ListEmptyComponent helper and create its style rules.",
    imports: [{ source: "react-native", names: ["Text", "View"] }],
    handlerPlaceholders: [
      {
        index: 6,
        name: "renderListEmpty",
        propName: "ListEmptyComponent",
        text: (handlerName, indentation) =>
          `\n${indentation}const ${handlerName} = () => {\n` +
          `${indentation}  return (\n` +
          `${indentation}    <View style={styles.listEmptyState}>\n` +
          `${indentation}      <Text style={styles.listEmptyTitle}>No items found</Text>\n` +
          `${indentation}      <Text style={styles.listEmptySubtitle}>Try changing your filters or create a new item.</Text>\n` +
          `${indentation}    </View>\n` +
          `${indentation}  );\n` +
          `${indentation}};\n\n`
      }
    ],
    rulePlaceholders: [
      { index: 1, name: "listEmptyState" },
      { index: 2, name: "listEmptyTitle" },
      { index: 4, name: "listEmptySubtitle" }
    ],
    rules: ["listEmptyState", "listEmptyTitle", "listEmptySubtitle"],
    body: [
      "ListEmptyComponent={${6:renderListEmpty}}$0"
    ]
  }
};

const SPECIAL_COLOR_VALUE_PROPS = new Set([
  "placeholderTextColor",
  "selectionColor",
  "underlineColorAndroid",
  "thumbTintColor",
  "tintColor"
]);

function createStyleAliasCompletion(alias, propertyName, range) {
  const item = new vscode.CompletionItem(
    alias,
    vscode.CompletionItemKind.Property
  );

  item.detail = `React Native style alias -> ${propertyName}`;
  item.documentation = new vscode.MarkdownString(
    `Expands \`${alias}\` into \`${propertyName}: value\`.`
  );
  item.filterText = alias;
  item.sortText = `0-${alias}`;
  item.range = range;
  item.insertText = new vscode.SnippetString(`${propertyName}: $1,`);

  return item;
}

function createStyleValueAliasCompletion(alias, propertyName, value, range) {
  const item = new vscode.CompletionItem(
    alias,
    vscode.CompletionItemKind.Value
  );

  item.detail = `React Native style alias -> ${propertyName}: ${value}`;
  item.documentation = new vscode.MarkdownString(
    `Expands \`${alias}\` into \`${propertyName}: ${value}\`.`
  );
  item.filterText = alias;
  item.sortText = `0-${alias}`;
  item.range = range;
  item.insertText = new vscode.SnippetString(`${propertyName}: ${value},`);

  return item;
}

function getCurrentWordRange(document, position) {
  const fullLineRange = new vscode.Range(
    new vscode.Position(position.line, 0),
    new vscode.Position(position.line, document.lineAt(position.line).text.length)
  );
  const lineText = document.getText(fullLineRange);
  const cursorCharacter = position.character;
  let start = cursorCharacter;
  let end = cursorCharacter;

  while (start > 0 && /[A-Za-z0-9_$]/.test(lineText[start - 1])) {
    start -= 1;
  }

  while (end < lineText.length && /[A-Za-z0-9_$]/.test(lineText[end])) {
    end += 1;
  }

  if (start === end) {
    return null;
  }

  const candidate = lineText.slice(start, end);

  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(candidate)) {
    return null;
  }

  return new vscode.Range(
    new vscode.Position(position.line, start),
    new vscode.Position(position.line, end)
  );
}

function getWordValue(document, wordRange) {
  return wordRange ? document.getText(wordRange) : "";
}

function getStyleAliasWordRange(document, position) {
  const fullLineRange = new vscode.Range(
    new vscode.Position(position.line, 0),
    new vscode.Position(position.line, document.lineAt(position.line).text.length)
  );
  const lineText = document.getText(fullLineRange);
  const cursorCharacter = position.character;
  let start = cursorCharacter;
  let end = cursorCharacter;

  while (start > 0 && /[A-Za-z0-9-]/.test(lineText[start - 1])) {
    start -= 1;
  }

  while (end < lineText.length && /[A-Za-z0-9-]/.test(lineText[end])) {
    end += 1;
  }

  if (start === end) {
    return null;
  }

  const candidate = lineText.slice(start, end);

  if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(candidate)) {
    return null;
  }

  return new vscode.Range(
    new vscode.Position(position.line, start),
    new vscode.Position(position.line, end)
  );
}

function endsWithStylePropAssignment(text) {
  return /\b(?:[A-Za-z][A-Za-z0-9_]*)?Style\s*=\s*$/i.test(text);
}

function endsWithHandlerPropAssignment(text) {
  return /\b(?:on[A-Z][A-Za-z0-9_]*|renderItem|keyExtractor|ListEmptyComponent|ListHeaderComponent|ListFooterComponent|ItemSeparatorComponent|renderSectionHeader|renderSectionFooter)\s*=\s*$/i.test(
    text
  );
}

function endsWithStyleSheetCreateCall(text) {
  return /StyleSheet\.create\s*\(\s*$/i.test(text);
}

function endsWithObjectProperty(text) {
  return /[A-Za-z_$][A-Za-z0-9_$]*\s*:\s*$/i.test(text);
}

function endsWithInlineObjectStart(text) {
  return /(?:\[|,|\?|:)\s*$/.test(text);
}

function getLastContext(contextStack) {
  return contextStack.length ? contextStack[contextStack.length - 1] : null;
}

function getTokenContextType(prefix, contextStack, token) {
  const parentContext = getLastContext(contextStack);

  if (token === "[") {
    if (
      parentContext === "jsx-style-expression" ||
      parentContext === "style-array"
    ) {
      return "style-array";
    }

    return "generic-array";
  }

  if (endsWithStylePropAssignment(prefix)) {
    return "jsx-style-expression";
  }

  if (endsWithHandlerPropAssignment(prefix)) {
    return "jsx-handler-expression";
  }

  if (endsWithStyleSheetCreateCall(prefix)) {
    return "stylesheet-root";
  }

  if (parentContext === "jsx-style-expression") {
    return "style-object";
  }

  if (
    parentContext === "stylesheet-root" &&
    endsWithObjectProperty(prefix)
  ) {
    return "style-object";
  }

  if (
    parentContext === "style-object" &&
    endsWithObjectProperty(prefix)
  ) {
    return "style-object";
  }

  if (
    (parentContext === "jsx-style-expression" ||
      parentContext === "style-array" ||
      parentContext === "style-object") &&
    endsWithInlineObjectStart(prefix)
  ) {
    return "style-object";
  }

  return "generic";
}

function getActiveContexts(text) {
  const contextStack = [];

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === "{" || character === "[") {
      const prefix = text.slice(Math.max(0, index - 160), index);
      const contextType = getTokenContextType(prefix, contextStack, character);
      contextStack.push(contextType);
    } else if (character === "}" || character === "]") {
      contextStack.pop();
    }
  }

  return contextStack;
}

function getContextsBeforeCursor(document, position) {
  const textBeforeCursor = document.getText(
    new vscode.Range(new vscode.Position(0, 0), position)
  );

  return getActiveContexts(textBeforeCursor);
}

function isInsideStyleContext(document, position) {
  const contexts = getContextsBeforeCursor(document, position);

  return contexts.includes("style-object");
}

function isInsideStyleReferenceContext(document, position) {
  const contexts = getContextsBeforeCursor(document, position);
  const currentContext = getLastContext(contexts);

  return (
    currentContext === "jsx-style-expression" ||
    currentContext === "style-array"
  );
}

function isInsideHandlerReferenceContext(document, position) {
  const contexts = getContextsBeforeCursor(document, position);
  const currentContext = getLastContext(contexts);

  return currentContext === "jsx-handler-expression";
}

function isLikelyStylePropertyPosition(document, position, wordRange) {
  const wordStart = wordRange ? wordRange.start : position;
  const linePrefix = document.getText(
    new vscode.Range(new vscode.Position(position.line, 0), wordStart)
  );
  const trimmedLinePrefix = linePrefix.trim();

  if (!trimmedLinePrefix) {
    return true;
  }

  if (trimmedLinePrefix.startsWith("//")) {
    return false;
  }

  if (/[.]\s*$/.test(trimmedLinePrefix)) {
    return false;
  }

  if (/\breturn\s+$/.test(trimmedLinePrefix)) {
    return false;
  }

  return !/:\s*[^,]*$/.test(trimmedLinePrefix);
}

function isLikelyStyleReferencePosition(document, position, wordRange) {
  const wordStart = wordRange ? wordRange.start : position;
  const linePrefix = document.getText(
    new vscode.Range(new vscode.Position(position.line, 0), wordStart)
  );
  const trimmedLinePrefix = linePrefix.trim();

  if (trimmedLinePrefix.startsWith("//")) {
    return false;
  }

  if (/:\s*[^,]*$/.test(trimmedLinePrefix)) {
    return false;
  }

  return !/\breturn\s+$/.test(trimmedLinePrefix);
}

function isLikelyHandlerReferencePosition(document, position, wordRange) {
  const wordStart = wordRange ? wordRange.start : position;
  const linePrefix = document.getText(
    new vscode.Range(new vscode.Position(position.line, 0), wordStart)
  );
  const trimmedLinePrefix = linePrefix.trim();

  if (trimmedLinePrefix.startsWith("//")) {
    return false;
  }

  if (/:\s*[^,]*$/.test(trimmedLinePrefix)) {
    return false;
  }

  if (/[.]\s*$/.test(trimmedLinePrefix)) {
    return false;
  }

  return !/\breturn\s+$/.test(trimmedLinePrefix);
}

function getCurrentJsxPropName(document, position) {
  const startOffset = Math.max(0, document.offsetAt(position) - 240);
  const textBeforeCursor = document.getText(
    new vscode.Range(document.positionAt(startOffset), position)
  );
  const inlineExpressionMatch =
    /([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*\{[^{}]*$/m.exec(textBeforeCursor);

  if (inlineExpressionMatch) {
    return inlineExpressionMatch[1];
  }

  const assignmentMatch =
    /([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*$/m.exec(textBeforeCursor);

  return assignmentMatch ? assignmentMatch[1] : null;
}

function toLowerCamelCase(value) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toLowerCase() + value.slice(1);
}

const DEFAULT_STYLE_RULE_NAME_BY_PROP = {
  style: "container",
  contentContainerStyle: "content",
  buttonStyle: "button",
  cardStyle: "card",
  columnWrapperStyle: "columnWrapper",
  containerStyle: "container",
  contentStyle: "content",
  footerStyle: "footer",
  headerStyle: "header",
  iconStyle: "icon",
  imageStyle: "image",
  indicatorStyle: "indicator",
  inputStyle: "input",
  itemStyle: "item",
  labelStyle: "label",
  lineStyle: "line",
  ListFooterComponentStyle: "listFooter",
  ListHeaderComponentStyle: "listHeader",
  modalStyle: "modal",
  overlayStyle: "overlay",
  safeAreaStyle: "safeArea",
  sectionStyle: "section",
  separatorStyle: "separator",
  subtitleStyle: "subtitle",
  tabStyle: "tab",
  textStyle: "text",
  titleStyle: "title",
  wrapperStyle: "wrapper"
};

function getDefaultStyleRuleNameForProp(propName) {
  if (!propName) {
    return null;
  }

  if (DEFAULT_STYLE_RULE_NAME_BY_PROP[propName]) {
    return DEFAULT_STYLE_RULE_NAME_BY_PROP[propName];
  }

  if (!propName.endsWith("Style")) {
    return null;
  }

  const baseName = propName.slice(0, -"Style".length);

  return isValidStyleRuleName(toLowerCamelCase(baseName))
    ? toLowerCamelCase(baseName)
    : null;
}

function getEnclosingJsxTagName(document, position) {
  const fullText = document.getText();
  const cursorOffset = document.offsetAt(position);
  const tagRegex = /<([A-Z][A-Za-z0-9_$]*)\b[^>]*>/g;
  let match = tagRegex.exec(fullText);
  let selectedTagName = null;

  while (match) {
    const tagName = match[1];
    const tagOpenIndex = match.index;
    const tagCloseIndex = fullText.indexOf(">", tagOpenIndex);

    if (tagCloseIndex < 0 || cursorOffset > tagCloseIndex) {
      match = tagRegex.exec(fullText);
      continue;
    }

    const closingTagRegex = new RegExp(`</${tagName}\\s*>`, "g");
    closingTagRegex.lastIndex = tagCloseIndex + 1;
    const closingMatch = closingTagRegex.exec(fullText);

    if (
      closingMatch &&
      cursorOffset >= tagOpenIndex &&
      cursorOffset <= closingMatch.index + closingMatch[0].length
    ) {
      selectedTagName = tagName;
    }

    match = tagRegex.exec(fullText);
  }

  return selectedTagName;
}

function getSuggestedStyleRuleName(document, position, propName) {
  if (propName === "style") {
    const tagName = getEnclosingJsxTagName(document, position);

    if (tagName && JSX_STYLE_RULE_NAME_BY_TAG[tagName]) {
      return JSX_STYLE_RULE_NAME_BY_TAG[tagName];
    }
  }

  return getDefaultStyleRuleNameForProp(propName);
}

function findMatchingClosingBrace(text, openingBraceIndex) {
  return findMatchingDelimiter(text, openingBraceIndex, "{", "}");
}

function findMatchingDelimiter(text, openingIndex, openChar, closeChar) {
  let depth = 0;

  for (let index = openingIndex; index < text.length; index += 1) {
    const character = text[index];
    const skippedIndex = skipStringOrComment(text, index);

    if (skippedIndex !== index) {
      index = skippedIndex - 1;
      continue;
    }

    if (character === openChar) {
      depth += 1;
    } else if (character === closeChar) {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function skipStringOrComment(text, index) {
  const character = text[index];
  const nextCharacter = text[index + 1];

  if (character === "'" || character === '"') {
    let cursor = index + 1;

    while (cursor < text.length) {
      if (text[cursor] === "\\") {
        cursor += 2;
        continue;
      }

      if (text[cursor] === character) {
        return cursor + 1;
      }

      cursor += 1;
    }

    return text.length;
  }

  if (character === "`") {
    let cursor = index + 1;

    while (cursor < text.length) {
      if (text[cursor] === "\\") {
        cursor += 2;
        continue;
      }

      if (text[cursor] === "`") {
        return cursor + 1;
      }

      if (text[cursor] === "$" && text[cursor + 1] === "{") {
        const expressionEnd = findMatchingDelimiter(text, cursor + 1, "{", "}");

        if (expressionEnd < 0) {
          return text.length;
        }

        cursor = expressionEnd + 1;
        continue;
      }

      cursor += 1;
    }

    return text.length;
  }

  if (character === "/" && nextCharacter === "/") {
    let cursor = index + 2;

    while (cursor < text.length && text[cursor] !== "\n") {
      cursor += 1;
    }

    return cursor;
  }

  if (character === "/" && nextCharacter === "*") {
    let cursor = index + 2;

    while (cursor < text.length - 1) {
      if (text[cursor] === "*" && text[cursor + 1] === "/") {
        return cursor + 2;
      }

      cursor += 1;
    }

    return text.length;
  }

  return index;
}

function getCurrentDocumentConfig(document) {
  return vscode.workspace.getConfiguration(
    "reactNativeSnippetLab",
    document
  );
}

function isTypeScriptDocument(document) {
  return (
    document.languageId === "typescript" ||
    document.languageId === "typescriptreact"
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getTopLevelSegments(text) {
  const segments = [];
  let start = 0;
  let curlyDepth = 0;
  let squareDepth = 0;
  let parenDepth = 0;

  for (let index = 0; index < text.length; index += 1) {
    const skippedIndex = skipStringOrComment(text, index);

    if (skippedIndex !== index) {
      index = skippedIndex - 1;
      continue;
    }

    const character = text[index];

    if (character === "{") {
      curlyDepth += 1;
    } else if (character === "}") {
      curlyDepth -= 1;
    } else if (character === "[") {
      squareDepth += 1;
    } else if (character === "]") {
      squareDepth -= 1;
    } else if (character === "(") {
      parenDepth += 1;
    } else if (character === ")") {
      parenDepth -= 1;
    } else if (
      character === "," &&
      curlyDepth === 0 &&
      squareDepth === 0 &&
      parenDepth === 0
    ) {
      segments.push(text.slice(start, index));
      start = index + 1;
    }
  }

  segments.push(text.slice(start));

  return segments;
}

function splitTopLevelKeyValue(segment) {
  let curlyDepth = 0;
  let squareDepth = 0;
  let parenDepth = 0;

  for (let index = 0; index < segment.length; index += 1) {
    const skippedIndex = skipStringOrComment(segment, index);

    if (skippedIndex !== index) {
      index = skippedIndex - 1;
      continue;
    }

    const character = segment[index];

    if (character === "{") {
      curlyDepth += 1;
    } else if (character === "}") {
      curlyDepth -= 1;
    } else if (character === "[") {
      squareDepth += 1;
    } else if (character === "]") {
      squareDepth -= 1;
    } else if (character === "(") {
      parenDepth += 1;
    } else if (character === ")") {
      parenDepth -= 1;
    } else if (
      character === ":" &&
      curlyDepth === 0 &&
      squareDepth === 0 &&
      parenDepth === 0
    ) {
      return {
        key: segment.slice(0, index),
        value: segment.slice(index + 1)
      };
    }
  }

  return null;
}

function normalizeObjectPropertyKey(rawKey) {
  const trimmedKey = rawKey.trim();
  const quotedMatch = /^(["'])(.+)\1$/.exec(trimmedKey);

  if (quotedMatch) {
    return quotedMatch[2];
  }

  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(trimmedKey)) {
    return trimmedKey;
  }

  return null;
}

function inferValueType(valueText, propertyName) {
  const trimmedValue = valueText.trim();

  if (!trimmedValue) {
    return { baseType: "unknown", renderedType: "unknown" };
  }

  if (/^['"`]/.test(trimmedValue)) {
    const literalValue = trimmedValue
      .replace(/^['"`]/, "")
      .replace(/['"`]$/, "");

    return {
      baseType: "string",
      renderedType: "string",
      literalValue,
      isUnionCandidate: /^(type|status|variant|kind|mode)$/i.test(propertyName)
    };
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmedValue)) {
    return { baseType: "number", renderedType: "number" };
  }

  if (/^(true|false)$/.test(trimmedValue)) {
    return { baseType: "boolean", renderedType: "boolean" };
  }

  if (/^null$/.test(trimmedValue)) {
    return { baseType: "null", renderedType: "null" };
  }

  if (/^\[/.test(trimmedValue)) {
    return { baseType: "array", renderedType: "unknown[]" };
  }

  if (/^\{/.test(trimmedValue)) {
    return { baseType: "object", renderedType: "Record<string, unknown>" };
  }

  return { baseType: "unknown", renderedType: "unknown" };
}

function parseObjectLiteral(objectText) {
  const trimmedObject = objectText.trim();

  if (!trimmedObject.startsWith("{") || !trimmedObject.endsWith("}")) {
    return [];
  }

  const body = trimmedObject.slice(1, -1);

  return getTopLevelSegments(body)
    .map((segment) => splitTopLevelKeyValue(segment))
    .filter(Boolean)
    .map(({ key, value }) => {
      const propertyName = normalizeObjectPropertyKey(key);

      if (!propertyName) {
        return null;
      }

      return {
        name: propertyName,
        typeInfo: inferValueType(value, propertyName)
      };
    })
    .filter(Boolean);
}

function extractTopLevelObjectLiteralsFromArray(arrayText) {
  const objectLiterals = [];

  for (let index = 0; index < arrayText.length; index += 1) {
    const skippedIndex = skipStringOrComment(arrayText, index);

    if (skippedIndex !== index) {
      index = skippedIndex - 1;
      continue;
    }

    if (arrayText[index] === "{") {
      const closingBraceIndex = findMatchingDelimiter(arrayText, index, "{", "}");

      if (closingBraceIndex < 0) {
        continue;
      }

      objectLiterals.push(arrayText.slice(index, closingBraceIndex + 1));
      index = closingBraceIndex;
    }
  }

  return objectLiterals;
}

function collectTypeCandidates(objectEntries) {
  const properties = new Map();

  objectEntries.forEach((entry) => {
    const currentProperty = properties.get(entry.name) || {
      orderedName: entry.name,
      baseTypes: new Set(),
      renderedTypes: new Set(),
      stringLiteralValues: new Set(),
      isUnionCandidate: false
    };

    currentProperty.baseTypes.add(entry.typeInfo.baseType);
    currentProperty.renderedTypes.add(entry.typeInfo.renderedType);

    if (entry.typeInfo.literalValue) {
      currentProperty.stringLiteralValues.add(entry.typeInfo.literalValue);
    }

    if (entry.typeInfo.isUnionCandidate) {
      currentProperty.isUnionCandidate = true;
    }

    properties.set(entry.name, currentProperty);
  });

  return Array.from(properties.values()).map((property) => {
    let renderedType = Array.from(property.renderedTypes).sort().join(" | ");

    if (property.baseTypes.size === 1 && property.baseTypes.has("string")) {
      renderedType = "string";

      if (
        property.isUnionCandidate &&
        property.stringLiteralValues.size > 0 &&
        property.stringLiteralValues.size <= 6
      ) {
        renderedType = Array.from(property.stringLiteralValues)
          .sort()
          .map((value) => `'${value.replace(/'/g, "\\'")}'`)
          .join(" | ");
      }
    }

    if (
      property.baseTypes.has("string") &&
      property.baseTypes.size > 1
    ) {
      renderedType = Array.from(property.renderedTypes)
        .filter((typeName) => typeName !== "string")
        .concat("string")
        .sort()
        .join(" | ");
    }

    return {
      name: property.orderedName,
      type: renderedType
    };
  });
}

function findTypeAliases(document) {
  const fullText = document.getText();
  const aliases = [];
  const typeRegex = /type\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*\{/g;
  let match = typeRegex.exec(fullText);

  while (match) {
    const name = match[1];
    const openingBraceIndex = match.index + match[0].lastIndexOf("{");
    const closingBraceIndex = findMatchingClosingBrace(fullText, openingBraceIndex);

    if (closingBraceIndex > openingBraceIndex) {
      aliases.push({
        bodyRange: new vscode.Range(
          document.positionAt(openingBraceIndex + 1),
          document.positionAt(closingBraceIndex)
        ),
        fullRange: new vscode.Range(
          document.positionAt(match.index),
          document.positionAt(closingBraceIndex + 1)
        ),
        name,
        nameRange: new vscode.Range(
          document.positionAt(match.index + match[0].indexOf(name)),
          document.positionAt(match.index + match[0].indexOf(name) + name.length)
        ),
        openingBraceIndex
      });
    }

    match = typeRegex.exec(fullText);
  }

  return aliases;
}

function findTypedConstMatches(document, typeName) {
  const fullText = document.getText();
  const escapedTypeName = escapeRegExp(typeName);
  const constRegex = new RegExp(
    `const\\s+[A-Za-z_$][A-Za-z0-9_$]*\\s*:\\s*${escapedTypeName}(\\[\\])?\\s*=`,
    "g"
  );
  const matches = [];
  let match = constRegex.exec(fullText);

  while (match) {
    const isArray = Boolean(match[1]);
    let cursor = match.index + match[0].length;

    while (cursor < fullText.length && /\s/.test(fullText[cursor])) {
      cursor += 1;
    }

    if (isArray && fullText[cursor] === "[") {
      const closingBracketIndex = findMatchingDelimiter(fullText, cursor, "[", "]");

      if (closingBracketIndex > cursor) {
        matches.push({
          isArray: true,
          literalText: fullText.slice(cursor, closingBracketIndex + 1)
        });
      }
    } else if (!isArray && fullText[cursor] === "{") {
      const closingBraceIndex = findMatchingDelimiter(fullText, cursor, "{", "}");

      if (closingBraceIndex > cursor) {
        matches.push({
          isArray: false,
          literalText: fullText.slice(cursor, closingBraceIndex + 1)
        });
      }
    }

    match = constRegex.exec(fullText);
  }

  return matches;
}

function findTypedConstDeclarations(document) {
  const fullText = document.getText();
  const declarations = [];
  const constRegex =
    /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*([A-Za-z_$][A-Za-z0-9_$]*)(\[\])?\s*=/g;
  let match = constRegex.exec(fullText);

  while (match) {
    const variableName = match[1];
    const typeName = match[2];
    const isArray = Boolean(match[3]);
    let cursor = match.index + match[0].length;

    while (cursor < fullText.length && /\s/.test(fullText[cursor])) {
      cursor += 1;
    }

    let literalText = null;
    let literalRange = null;

    if (isArray && fullText[cursor] === "[") {
      const closingBracketIndex = findMatchingDelimiter(fullText, cursor, "[", "]");

      if (closingBracketIndex > cursor) {
        literalText = fullText.slice(cursor, closingBracketIndex + 1);
        literalRange = new vscode.Range(
          document.positionAt(cursor),
          document.positionAt(closingBracketIndex + 1)
        );
      }
    } else if (!isArray && fullText[cursor] === "{") {
      const closingBraceIndex = findMatchingDelimiter(fullText, cursor, "{", "}");

      if (closingBraceIndex > cursor) {
        literalText = fullText.slice(cursor, closingBraceIndex + 1);
        literalRange = new vscode.Range(
          document.positionAt(cursor),
          document.positionAt(closingBraceIndex + 1)
        );
      }
    }

    if (literalText && literalRange) {
      declarations.push({
        isArray,
        literalRange,
        literalText,
        name: variableName,
        range: new vscode.Range(
          document.positionAt(match.index),
          literalRange.end
        ),
        typeName
      });
    }

    match = constRegex.exec(fullText);
  }

  return declarations;
}

function inferTypePropertiesFromTypedConsts(document, typeName) {
  const matches = findTypedConstMatches(document, typeName);
  const objectEntries = [];

  matches.forEach((match) => {
    if (match.isArray) {
      const objectLiterals = extractTopLevelObjectLiteralsFromArray(match.literalText);

      objectLiterals.forEach((objectLiteral) => {
        objectEntries.push(...parseObjectLiteral(objectLiteral));
      });
    } else {
      objectEntries.push(...parseObjectLiteral(match.literalText));
    }
  });

  if (!objectEntries.length) {
    return [];
  }

  return collectTypeCandidates(objectEntries);
}

function inferTypePropertiesFromDeclaration(declaration) {
  const objectEntries = [];

  if (declaration.isArray) {
    const objectLiterals = extractTopLevelObjectLiteralsFromArray(
      declaration.literalText
    );

    objectLiterals.forEach((objectLiteral) => {
      objectEntries.push(...parseObjectLiteral(objectLiteral));
    });
  } else {
    objectEntries.push(...parseObjectLiteral(declaration.literalText));
  }

  if (!objectEntries.length) {
    return [];
  }

  return collectTypeCandidates(objectEntries);
}

function toPascalCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1))
    .join("");
}

function singularizeVariableName(value) {
  if (/ies$/i.test(value)) {
    return value.replace(/ies$/i, "y");
  }

  if (/ses$/i.test(value)) {
    return value.replace(/es$/i, "");
  }

  if (/s$/i.test(value) && value.length > 1) {
    return value.slice(0, -1);
  }

  return value;
}

function guessTypeNameFromVariableName(variableName, isArray) {
  const baseName = isArray ? singularizeVariableName(variableName) : variableName;
  const pascalName = toPascalCase(baseName);

  return pascalName || "Item";
}

function findTypeAliasByName(document, typeName) {
  return findTypeAliases(document).find((alias) => alias.name === typeName) || null;
}

function positionInRange(position, range) {
  return (
    position.isAfterOrEqual(range.start) &&
    position.isBeforeOrEqual(range.end)
  );
}

function findTypeAliasAtPosition(document, position) {
  return (
    findTypeAliases(document).find(
      (alias) =>
        positionInRange(position, alias.nameRange) ||
        positionInRange(position, alias.fullRange)
    ) || null
  );
}

function findTypedConstDeclarationAtPosition(document, position) {
  return (
    findTypedConstDeclarations(document).find((declaration) =>
      positionInRange(position, declaration.range)
    ) || null
  );
}

function findUntypedConstDeclarations(document) {
  const fullText = document.getText();
  const declarations = [];
  const constRegex =
    /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*/g;
  let match = constRegex.exec(fullText);

  while (match) {
    const variableName = match[1];
    const variableNameIndex = match.index + match[0].indexOf(variableName);
    const variableNameEnd = variableNameIndex + variableName.length;
    let cursor = match.index + match[0].length;

    while (cursor < fullText.length && /\s/.test(fullText[cursor])) {
      cursor += 1;
    }

    let literalText = null;
    let literalRange = null;
    let isArray = false;

    if (fullText[cursor] === "[") {
      const closingBracketIndex = findMatchingDelimiter(fullText, cursor, "[", "]");

      if (closingBracketIndex > cursor) {
        literalText = fullText.slice(cursor, closingBracketIndex + 1);
        literalRange = new vscode.Range(
          document.positionAt(cursor),
          document.positionAt(closingBracketIndex + 1)
        );
        isArray = true;
      }
    } else if (fullText[cursor] === "{") {
      const closingBraceIndex = findMatchingDelimiter(fullText, cursor, "{", "}");

      if (closingBraceIndex > cursor) {
        literalText = fullText.slice(cursor, closingBraceIndex + 1);
        literalRange = new vscode.Range(
          document.positionAt(cursor),
          document.positionAt(closingBraceIndex + 1)
        );
      }
    }

    if (literalText && literalRange) {
      declarations.push({
        inferredTypeName: guessTypeNameFromVariableName(variableName, isArray),
        isArray,
        literalRange,
        literalText,
        name: variableName,
        range: new vscode.Range(
          document.positionAt(match.index),
          literalRange.end
        ),
        typeInsertionPosition: document.positionAt(variableNameEnd)
      });
    }

    match = constRegex.exec(fullText);
  }

  return declarations;
}

function findUntypedConstDeclarationAtPosition(document, position) {
  return (
    findUntypedConstDeclarations(document).find((declaration) =>
      positionInRange(position, declaration.range) ||
      positionInRange(position, declaration.literalRange)
    ) || null
  );
}

function buildTypeAliasBody(document, typeAlias, inferredProperties) {
  const openingLine = document.lineAt(
    document.positionAt(typeAlias.openingBraceIndex).line
  );
  const openingIndentation = openingLine.text.match(/^\s*/)[0];
  const propertyIndentation = `${openingIndentation}  `;

  if (!inferredProperties.length) {
    return "\n";
  }

  return (
    "\n" +
    inferredProperties
      .map(
        (property) => `${propertyIndentation}${property.name}: ${property.type};`
      )
      .join("\n") +
    "\n" +
    openingIndentation
  );
}

function buildTypeAliasBlock(typeName, inferredProperties) {
  if (!inferredProperties.length) {
    return `type ${typeName} = {};\n`;
  }

  return (
    `type ${typeName} = {\n` +
    inferredProperties
      .map((property) => `  ${property.name}: ${property.type};`)
      .join("\n") +
    `\n};\n`
  );
}

function getTypeAliasInsertPosition(document) {
  return getImportInsertionPosition(document);
}

function buildTypeAliasInsertText(document, typeName, inferredProperties) {
  const fullText = document.getText();
  const insertPosition = getTypeAliasInsertPosition(document);
  const insertOffset = document.offsetAt(insertPosition);
  const prefix =
    insertOffset === 0
      ? ""
      : fullText.slice(0, insertOffset).endsWith("\n\n")
        ? ""
        : fullText.slice(0, insertOffset).endsWith("\n")
          ? "\n"
          : "\n\n";
  const suffix =
    insertOffset < fullText.length && !fullText.slice(insertOffset).startsWith("\n")
      ? "\n"
      : "";

  return `${prefix}${buildTypeAliasBlock(typeName, inferredProperties)}${suffix}`;
}

function createTypeAliasUpdateCodeAction(document, typeAlias, inferredProperties, title) {
  const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
  const edit = new vscode.WorkspaceEdit();

  edit.replace(
    document.uri,
    typeAlias.bodyRange,
    buildTypeAliasBody(document, typeAlias, inferredProperties)
  );
  action.edit = edit;

  return action;
}

function createInlineStyleExtractCodeAction(document, inlineStyle, position) {
  const styleSheetInfo =
    getStyleSheetInfo(document, position) || getNewStyleSheetInfo(document);
  const baseRuleName =
    getSuggestedStyleRuleName(document, position, inlineStyle.propName) || "style";
  const ruleName = getUniqueRuleNames(
    [baseRuleName],
    styleSheetInfo.ruleNames || []
  )[0];
  const action = new vscode.CodeAction(
    `Extract inline ${inlineStyle.propName} to styles.${ruleName}`,
    vscode.CodeActionKind.RefactorExtract
  );
  const edit = new vscode.WorkspaceEdit();

  edit.replace(
    document.uri,
    inlineStyle.expressionRange,
    `{styles.${ruleName}}`
  );

  if (styleSheetInfo.exists) {
    edit.replace(
      document.uri,
      styleSheetInfo.insertRange,
      buildStyleRulesFromObjects(
        [{ objectLiteralText: inlineStyle.objectLiteralText, ruleName }],
        styleSheetInfo
      )
    );
  } else {
    getStyleSheetImportEdits(document).forEach((textEdit) => {
      if (textEdit.newText !== undefined) {
        if (textEdit.range) {
          edit.replace(document.uri, textEdit.range, textEdit.newText);
        } else {
          edit.insert(document.uri, textEdit.position, textEdit.newText);
        }
      }
    });
    edit.insert(
      document.uri,
      styleSheetInfo.insertPosition,
      buildNewStyleSheetBlockWithStyleEntries(document, [
        { objectLiteralText: inlineStyle.objectLiteralText, ruleName }
      ])
    );
  }

  action.edit = edit;
  action.command = {
    command: "reactNativeSnippetLab.selectInsertedStyleRule",
    title: "Select inserted style rule",
    arguments: [ruleName]
  };

  return action;
}

function getCurrentIdentifierValue(document, position) {
  const range = document.getWordRangeAtPosition(
    position,
    /[A-Za-z_$][A-Za-z0-9_$]*/
  );

  if (!range) {
    return null;
  }

  return {
    range,
    value: document.getText(range)
  };
}

function getUsedKnownReactNativeSymbols(document) {
  const fullText = document.getText();
  const usedSymbols = new Set();

  Object.keys(REACT_NATIVE_SYMBOL_SOURCES).forEach((symbol) => {
    if (symbol === "AppState" || symbol === "StyleSheet" || symbol === "useWindowDimensions") {
      if (new RegExp(`\\b${escapeForRegex(symbol)}\\b`).test(fullText)) {
        usedSymbols.add(symbol);
      }

      return;
    }

    if (new RegExp(`<${escapeForRegex(symbol)}\\b`).test(fullText)) {
      usedSymbols.add(symbol);
    }
  });

  return Array.from(usedSymbols);
}

function getMissingKnownReactNativeImports(document) {
  const usedSymbols = getUsedKnownReactNativeSymbols(document);
  const imports = new Map();

  usedSymbols.forEach((symbol) => {
    const source = REACT_NATIVE_SYMBOL_SOURCES[symbol];

    if (!source) {
      return;
    }

    const importInfo = getNamedImportInfo(document, source);

    if (importInfo.importedNames.includes(symbol)) {
      return;
    }

    const symbols = imports.get(source) || new Set();
    symbols.add(symbol);
    imports.set(source, symbols);
  });

  return Array.from(imports.entries()).map(([source, names]) => ({
    source,
    names: Array.from(names)
  }));
}

function applyTextEditToWorkspaceEdit(edit, uri, textEdit) {
  if (textEdit.newText === undefined) {
    return;
  }

  if (textEdit.range) {
    edit.replace(uri, textEdit.range, textEdit.newText);
    return;
  }

  edit.insert(uri, textEdit.position, textEdit.newText);
}

function createMissingImportCodeAction(document, source, symbol) {
  const action = new vscode.CodeAction(
    `Add import for ${symbol} from ${source}`,
    vscode.CodeActionKind.QuickFix
  );
  const edit = new vscode.WorkspaceEdit();

  getNamedImportEdits(document, source, [symbol]).forEach((textEdit) => {
    applyTextEditToWorkspaceEdit(edit, document.uri, textEdit);
  });
  action.edit = edit;

  return action;
}

function getReactNativeProductivityCodeActions(document, range) {
  const position = range.start;
  const actions = [];
  const inlineStyle = findInlineStyleAtPosition(document, position);

  if (inlineStyle) {
    actions.push(createInlineStyleExtractCodeAction(document, inlineStyle, position));
  }

  const currentIdentifier = getCurrentIdentifierValue(document, position);

  if (currentIdentifier) {
    const source = REACT_NATIVE_SYMBOL_SOURCES[currentIdentifier.value];

    if (source) {
      const importInfo = getNamedImportInfo(document, source);

      if (!importInfo.importedNames.includes(currentIdentifier.value)) {
        actions.push(
          createMissingImportCodeAction(
            document,
            source,
            currentIdentifier.value
          )
        );
      }
    }
  }

  return actions;
}

function createTypeAliasAndAnnotationEdit(
  document,
  declaration,
  typeName,
  inferredProperties
) {
  const edit = new vscode.WorkspaceEdit();

  edit.insert(
    document.uri,
    getTypeAliasInsertPosition(document),
    buildTypeAliasInsertText(document, typeName, inferredProperties)
  );
  edit.insert(
    document.uri,
    declaration.typeInsertionPosition,
    `: ${typeName}${declaration.isArray ? "[]" : ""}`
  );

  return edit;
}

function createTypeAliasCreateCodeAction(document, typeName, inferredProperties, title) {
  const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
  const edit = new vscode.WorkspaceEdit();

  edit.insert(
    document.uri,
    getTypeAliasInsertPosition(document),
    buildTypeAliasInsertText(document, typeName, inferredProperties)
  );
  action.edit = edit;

  return action;
}

function getTypeAliasCodeActions(document, range) {
  if (!isTypeScriptDocument(document)) {
    return [];
  }

  const position = range.start;
  const actions = [];
  const typeAlias = findTypeAliasAtPosition(document, position);

  if (typeAlias) {
    const inferredProperties = inferTypePropertiesFromTypedConsts(
      document,
      typeAlias.name
    );
    const nextBody = inferredProperties.length
      ? buildTypeAliasBody(document, typeAlias, inferredProperties)
      : null;

    if (nextBody && document.getText(typeAlias.bodyRange) !== nextBody) {
      const declarations = findTypedConstDeclarations(document).filter(
        (declaration) => declaration.typeName === typeAlias.name
      );
      const sourceLabel =
        declarations.length === 1
          ? declarations[0].name
          : "typed data";

      actions.push(
        createTypeAliasUpdateCodeAction(
          document,
          typeAlias,
          inferredProperties,
          `Fill type ${typeAlias.name} from ${sourceLabel}`
        )
      );
    }
  }

  const declaration = findTypedConstDeclarationAtPosition(document, position);

  if (!declaration) {
    return actions;
  }

  const inferredProperties = inferTypePropertiesFromDeclaration(declaration);

  if (!inferredProperties.length) {
    return actions;
  }

  const existingTypeAlias = findTypeAliasByName(document, declaration.typeName);

  if (existingTypeAlias) {
    const nextBody = buildTypeAliasBody(
      document,
      existingTypeAlias,
      inferredProperties
    );

    if (document.getText(existingTypeAlias.bodyRange) !== nextBody) {
      actions.push(
        createTypeAliasUpdateCodeAction(
          document,
          existingTypeAlias,
          inferredProperties,
          `Fill type ${declaration.typeName} from ${declaration.name}`
        )
      );
    }

    return actions;
  }

  actions.push(
    createTypeAliasCreateCodeAction(
      document,
      declaration.typeName,
      inferredProperties,
      `Create type ${declaration.typeName} from ${declaration.name}`
    )
  );

  return actions;
}

function inferTypePropertiesFromLooseLiteral(declaration) {
  return inferTypePropertiesFromDeclaration({
    isArray: declaration.isArray,
    literalText: declaration.literalText
  });
}

async function extractInlineStyleFromContext() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const { document, selection } = editor;
  const inlineStyle = findInlineStyleAtPosition(document, selection.active);

  if (!inlineStyle) {
    vscode.window.showInformationMessage(
      "Extraer Inline Style solo funciona dentro de style={{ ... }} o props que terminan en Style."
    );
    return;
  }

  const action = createInlineStyleExtractCodeAction(
    document,
    inlineStyle,
    selection.active
  );

  if (!action.edit) {
    return;
  }

  await vscode.workspace.applyEdit(action.edit);

  if (action.command) {
    await vscode.commands.executeCommand(
      action.command.command,
      ...(action.command.arguments || [])
    );
  }
}

async function addMissingReactNativeImports() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const { document } = editor;
  const missingImports = getMissingKnownReactNativeImports(document);

  if (!missingImports.length) {
    vscode.window.showInformationMessage(
      "No encontre imports faltantes de React Native en este archivo."
    );
    return;
  }

  const edit = new vscode.WorkspaceEdit();

  getImportEdits(document, missingImports).forEach((textEdit) => {
    applyTextEditToWorkspaceEdit(edit, document.uri, textEdit);
  });
  await vscode.workspace.applyEdit(edit);
}

async function typeObjectFromContext() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const { document, selection } = editor;

  if (!isTypeScriptDocument(document)) {
    vscode.window.showInformationMessage(
      "Tipar Objeto solo esta disponible en archivos TypeScript."
    );
    return;
  }

  const declaration = findUntypedConstDeclarationAtPosition(
    document,
    selection.active
  );

  if (!declaration) {
    vscode.window.showInformationMessage(
      "No encontre un objeto o array de objetos sin tipo en la posicion actual."
    );
    return;
  }

  const inferredProperties = inferTypePropertiesFromLooseLiteral(declaration);

  if (!inferredProperties.length) {
    vscode.window.showInformationMessage(
      "No pude inferir un type util desde ese objeto."
    );
    return;
  }

  const suggestedTypeName = declaration.inferredTypeName;
  const typeNameInput = await vscode.window.showInputBox({
    prompt: "Nombre del type",
    value: suggestedTypeName,
    validateInput(value) {
      return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value)
        ? null
        : "Escribe un nombre de type valido.";
    }
  });

  if (!typeNameInput) {
    return;
  }

  const existingTypeAlias = findTypeAliasByName(document, typeNameInput);
  const edit = existingTypeAlias
    ? (() => {
        const workspaceEdit = new vscode.WorkspaceEdit();

        workspaceEdit.replace(
          document.uri,
          existingTypeAlias.bodyRange,
          buildTypeAliasBody(document, existingTypeAlias, inferredProperties)
        );
        workspaceEdit.insert(
          document.uri,
          declaration.typeInsertionPosition,
          `: ${typeNameInput}${declaration.isArray ? "[]" : ""}`
        );

        return workspaceEdit;
      })()
    : createTypeAliasAndAnnotationEdit(
        document,
        declaration,
        typeNameInput,
        inferredProperties
      );

  await vscode.workspace.applyEdit(edit);
}

async function syncTypeAliasesForDocument(document) {
  const config = getCurrentDocumentConfig(document);

  if (!config.get("enableTypeSync", true) || !isTypeScriptDocument(document)) {
    return;
  }

  const typeAliases = findTypeAliases(document);

  if (!typeAliases.length) {
    return;
  }

  const edit = new vscode.WorkspaceEdit();
  let hasEdits = false;

  typeAliases.forEach((typeAlias) => {
    const inferredProperties = inferTypePropertiesFromTypedConsts(
      document,
      typeAlias.name
    );

    if (!inferredProperties.length) {
      return;
    }

    const nextBody = buildTypeAliasBody(document, typeAlias, inferredProperties);
    const currentBody = document.getText(typeAlias.bodyRange);

    if (currentBody !== nextBody) {
      edit.replace(document.uri, typeAlias.bodyRange, nextBody);
      hasEdits = true;
    }
  });

  if (!hasEdits) {
    return;
  }

  internalTypeSyncUpdates.add(document.uri.toString());

  try {
    await vscode.workspace.applyEdit(edit);
  } finally {
    setTimeout(() => {
      internalTypeSyncUpdates.delete(document.uri.toString());
    }, 0);
  }
}

function scheduleTypeAliasSync(document) {
  const uriKey = document.uri.toString();
  const existingTimer = typeSyncTimers.get(uriKey);

  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    typeSyncTimers.delete(uriKey);
    syncTypeAliasesForDocument(document);
  }, 250);

  typeSyncTimers.set(uriKey, timer);
}

function getTopLevelStyleRules(styleSheetBody, startOffset) {
  const rules = [];
  let curlyDepth = 0;
  let squareDepth = 0;
  let parenDepth = 0;

  for (let index = 0; index < styleSheetBody.length; ) {
    const character = styleSheetBody[index];

    if (character === "{") {
      curlyDepth += 1;
      index += 1;
      continue;
    }

    if (character === "}") {
      curlyDepth -= 1;
      index += 1;
      continue;
    }

    if (character === "[") {
      squareDepth += 1;
      index += 1;
      continue;
    }

    if (character === "]") {
      squareDepth -= 1;
      index += 1;
      continue;
    }

    if (character === "(") {
      parenDepth += 1;
      index += 1;
      continue;
    }

    if (character === ")") {
      parenDepth -= 1;
      index += 1;
      continue;
    }

    if (
      curlyDepth === 0 &&
      squareDepth === 0 &&
      parenDepth === 0 &&
      /[A-Za-z_$]/.test(character)
    ) {
      let cursor = index + 1;

      while (
        cursor < styleSheetBody.length &&
        /[A-Za-z0-9_$]/.test(styleSheetBody[cursor])
      ) {
        cursor += 1;
      }

      const ruleName = styleSheetBody.slice(index, cursor);
      const remainder = styleSheetBody.slice(cursor);

      if (/^\s*:/.test(remainder)) {
        rules.push({
          name: ruleName,
          startOffset: startOffset + index,
          endOffset: startOffset + cursor
        });
      }

      index = cursor;
      continue;
    }

    index += 1;
  }

  return rules;
}

function getStyleRuleIndentation(document, openingBraceIndex, styleSheetBody) {
  const firstRuleMatch = styleSheetBody.match(/^(\s*)[A-Za-z_$][A-Za-z0-9_$]*\s*:/m);

  if (firstRuleMatch) {
    return firstRuleMatch[1];
  }

  const openingLine = document.lineAt(document.positionAt(openingBraceIndex).line);
  const openingIndent = openingLine.text.match(/^\s*/)[0];

  return `${openingIndent}  `;
}

function getStyleSheetInfos(document) {
  const fullText = document.getText();
  const matches = fullText.matchAll(/StyleSheet\.create\s*\(\s*\{/g);
  const styleSheetInfos = [];

  for (const match of matches) {
    const openingBraceIndex = match.index + match[0].lastIndexOf("{");
    const closingBraceIndex = findMatchingClosingBrace(fullText, openingBraceIndex);

    if (closingBraceIndex < 0) {
      continue;
    }

    const styleSheetBody = fullText.slice(
      openingBraceIndex + 1,
      closingBraceIndex
    );
    const trailingWhitespaceMatch = /[\s\r\n]*$/.exec(styleSheetBody);
    const trailingWhitespaceLength = trailingWhitespaceMatch
      ? trailingWhitespaceMatch[0].length
      : 0;
    const insertOffset = closingBraceIndex - trailingWhitespaceLength;
    const rules = getTopLevelStyleRules(styleSheetBody, openingBraceIndex + 1);
    const indentation = getStyleRuleIndentation(
      document,
      openingBraceIndex,
      styleSheetBody
    );

    styleSheetInfos.push({
      closingBraceIndex,
      indentation,
      innerIndentation: `${indentation}  `,
      insertOffset,
      insertRange: new vscode.Range(
        document.positionAt(insertOffset),
        document.positionAt(closingBraceIndex)
      ),
      insertPosition: document.positionAt(closingBraceIndex),
      openingBraceIndex,
      rules,
      ruleNames: rules.map((rule) => rule.name),
      exists: true
    });
  }

  return styleSheetInfos;
}

function getStyleSheetInfo(document, position) {
  const styleSheetInfos = getStyleSheetInfos(document);

  if (!styleSheetInfos.length) {
    return null;
  }

  if (!position) {
    return styleSheetInfos[0];
  }

  const offset = document.offsetAt(position);
  const containingStyleSheet = styleSheetInfos.find(
    (info) => offset >= info.openingBraceIndex && offset <= info.closingBraceIndex
  );

  if (containingStyleSheet) {
    return containingStyleSheet;
  }

  return styleSheetInfos
    .slice()
    .sort((left, right) => {
      const leftDistance = Math.min(
        Math.abs(offset - left.openingBraceIndex),
        Math.abs(offset - left.closingBraceIndex)
      );
      const rightDistance = Math.min(
        Math.abs(offset - right.openingBraceIndex),
        Math.abs(offset - right.closingBraceIndex)
      );

      return leftDistance - rightDistance;
    })[0];
}

function buildStyleRuleText(ruleName, styleSheetInfo) {
  return `${styleSheetInfo.indentation}${ruleName}: {},\n`;
}

function buildStyleRulesText(ruleNames, styleSheetInfo) {
  return (
    `\n` +
    ruleNames
      .map((ruleName) => buildStyleRuleText(ruleName, styleSheetInfo))
      .join("")
  );
}

function scheduleUnusedStyleRuleCleanup(document) {
  const uriKey = document.uri.toString();
  const existingTimer = styleCleanupTimers.get(uriKey);
  const config = getCurrentDocumentConfig(document);

  if (existingTimer) {
    clearTimeout(existingTimer);
    styleCleanupTimers.delete(uriKey);
  }

  if (!config.get("cleanupUnusedEmptyStyles", true)) {
    return;
  }

  const timer = setTimeout(() => {
    styleCleanupTimers.delete(uriKey);
    cleanupUnusedEmptyStyleRules(document);
  }, 250);

  styleCleanupTimers.set(uriKey, timer);
}

function isStylePropName(propName) {
  return propName === "style" || /Style$/.test(propName);
}

function findInlineStyleAtPosition(document, position) {
  const fullText = document.getText();
  const cursorOffset = document.offsetAt(position);
  const stylePropRegex = /([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*\{/g;
  let match = stylePropRegex.exec(fullText);

  while (match) {
    const propName = match[1];

    if (!isStylePropName(propName)) {
      match = stylePropRegex.exec(fullText);
      continue;
    }

    const expressionStartIndex = match.index + match[0].lastIndexOf("{");
    let cursor = expressionStartIndex + 1;

    while (cursor < fullText.length && /\s/.test(fullText[cursor])) {
      cursor += 1;
    }

    if (fullText[cursor] !== "{") {
      match = stylePropRegex.exec(fullText);
      continue;
    }

    const objectStartIndex = cursor;
    const objectEndIndex = findMatchingDelimiter(fullText, objectStartIndex, "{", "}");

    if (objectEndIndex < 0) {
      match = stylePropRegex.exec(fullText);
      continue;
    }

    cursor = objectEndIndex + 1;

    while (cursor < fullText.length && /\s/.test(fullText[cursor])) {
      cursor += 1;
    }

    if (fullText[cursor] !== "}") {
      match = stylePropRegex.exec(fullText);
      continue;
    }

    const expressionEndIndex = cursor;
    const objectRange = new vscode.Range(
      document.positionAt(objectStartIndex),
      document.positionAt(objectEndIndex + 1)
    );
    const expressionRange = new vscode.Range(
      document.positionAt(expressionStartIndex),
      document.positionAt(expressionEndIndex + 1)
    );

    if (positionInRange(position, objectRange) || positionInRange(position, expressionRange)) {
      return {
        expressionRange,
        objectLiteralText: fullText.slice(objectStartIndex, objectEndIndex + 1),
        objectRange,
        propName
      };
    }

    match = stylePropRegex.exec(fullText);
  }

  return null;
}

function dedentBlock(text) {
  const normalized = text.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }

  while (lines.length && !lines[lines.length - 1].trim()) {
    lines.pop();
  }

  if (!lines.length) {
    return "";
  }

  const indentationLengths = lines
    .filter((line) => line.trim())
    .map((line) => (line.match(/^\s*/) || [""])[0].length);
  const minIndentation = indentationLengths.length
    ? Math.min(...indentationLengths)
    : 0;

  return lines
    .map((line) => line.slice(minIndentation))
    .join("\n")
    .trimEnd();
}

function buildStyleRuleFromObject(ruleName, objectLiteralText, indentation, innerIndentation) {
  const bodyText = dedentBlock(objectLiteralText.slice(1, -1));

  if (!bodyText.trim()) {
    return `${indentation}${ruleName}: {},\n`;
  }

  const formattedBody = bodyText
    .split("\n")
    .map((line) => `${innerIndentation}${line}`)
    .join("\n");

  return (
    `${indentation}${ruleName}: {\n` +
    `${formattedBody}\n` +
    `${indentation}},\n`
  );
}

function buildStyleRulesFromObjects(styleEntries, styleSheetInfo) {
  return (
    `\n` +
    styleEntries
      .map(({ objectLiteralText, ruleName }) =>
        buildStyleRuleFromObject(
          ruleName,
          objectLiteralText,
          styleSheetInfo.indentation,
          styleSheetInfo.innerIndentation
        )
      )
      .join("")
  );
}

function buildNewStyleSheetBlockWithStyleEntries(document, styleEntries) {
  const fullText = document.getText();
  const hasContent = fullText.trim().length > 0;
  const prefix = hasContent
    ? fullText.endsWith("\n")
      ? "\n"
      : "\n\n"
    : "";

  return (
    `${prefix}const styles = StyleSheet.create({\n` +
    styleEntries
      .map(({ objectLiteralText, ruleName }) =>
        buildStyleRuleFromObject(ruleName, objectLiteralText, "  ", "    ")
      )
      .join("") +
    `});\n`
  );
}

function isCompactEmptyStyleRuleLine(lineText, ruleName) {
  return new RegExp(
    `^\\s*${escapeForRegex(ruleName)}\\s*:\\s*\\{\\s*\\},\\s*$`
  ).test(lineText);
}

function hasStyleReference(documentText, ruleName) {
  return new RegExp(`styles\\.${escapeForRegex(ruleName)}\\b`).test(documentText);
}

function getLineDeletionRange(document, lineNumber) {
  const line = document.lineAt(lineNumber);

  if (lineNumber < document.lineCount - 1) {
    const nextLine = document.lineAt(lineNumber + 1);

    return new vscode.Range(line.range.start, nextLine.range.start);
  }

  return line.range;
}

async function cleanupUnusedEmptyStyleRules(document) {
  const styleSheetInfos = getStyleSheetInfos(document);

  if (!styleSheetInfos.length) {
    return;
  }

  const documentText = document.getText();
  const rulesToDelete = styleSheetInfos
    .flatMap((styleSheetInfo) =>
      styleSheetInfo.rules.map((rule) => {
        const lineNumber = document.positionAt(rule.startOffset).line;
        const lineText = document.lineAt(lineNumber).text;

        return {
          lineNumber,
          name: rule.name,
          range: getLineDeletionRange(document, lineNumber),
          shouldDelete:
            isCompactEmptyStyleRuleLine(lineText, rule.name) &&
            !hasStyleReference(documentText, rule.name)
        };
      })
    )
    .filter((rule) => rule.shouldDelete)
    .sort((left, right) => right.lineNumber - left.lineNumber);

  if (!rulesToDelete.length) {
    return;
  }

  const edit = new vscode.WorkspaceEdit();

  rulesToDelete.forEach((rule) => {
    edit.delete(document.uri, rule.range);
  });

  internalTypeSyncUpdates.add(document.uri.toString());

  try {
    await vscode.workspace.applyEdit(edit);
  } finally {
    setTimeout(() => {
      internalTypeSyncUpdates.delete(document.uri.toString());
    }, 0);
  }
}

function isValidStyleRuleName(value) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);
}

function escapeForRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseNamedImportSpecifiers(specifiersText) {
  return specifiersText
    .split(",")
    .map((specifier) => specifier.trim())
    .filter(Boolean);
}

function getImportedBindingName(specifier) {
  const aliasMatch = /^\s*([A-Za-z_$][A-Za-z0-9_$]*)\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*$/.exec(
    specifier
  );

  if (aliasMatch) {
    return aliasMatch[2];
  }

  const trimmedSpecifier = specifier.trim();

  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(trimmedSpecifier)
    ? trimmedSpecifier
    : null;
}

function getNamedImportStatements(document) {
  const fullText = document.getText();
  const importRegex =
    /import\s+(type\s+)?(?:(?<defaultImport>[A-Za-z_$][A-Za-z0-9_$]*)\s*,\s*)?\{(?<specifiers>[\s\S]*?)\}\s*from\s*['"](?<source>[^'"]+)['"];?/gm;
  const statements = [];
  let match = importRegex.exec(fullText);

  while (match) {
    const groups = match.groups || {};
    const specifiers = parseNamedImportSpecifiers(groups.specifiers || "");

    statements.push({
      defaultImport: groups.defaultImport || "",
      fullImport: match[0],
      importedNames: specifiers
        .map((specifier) => getImportedBindingName(specifier))
        .filter(Boolean),
      isTypeOnly: Boolean(match[1]),
      range: new vscode.Range(
        document.positionAt(match.index),
        document.positionAt(match.index + match[0].length)
      ),
      source: groups.source || ""
    });

    match = importRegex.exec(fullText);
  }

  return statements;
}

function getNamedImportInfo(document, moduleName) {
  const fullText = document.getText();
  const namedImportStatement = getNamedImportStatements(document).find(
    (statement) => statement.source === moduleName
  );

  if (namedImportStatement) {
    return {
      defaultImport: namedImportStatement.defaultImport,
      fullImport: namedImportStatement.fullImport,
      hasNamedImport: true,
      importedNames: namedImportStatement.importedNames,
      isTypeOnly: namedImportStatement.isTypeOnly,
      range: namedImportStatement.range
    };
  }

  const escapedModuleName = escapeForRegex(moduleName);

  const anyImportRegex = new RegExp(
    `import\\s+.*from\\s*['"]${escapedModuleName}['"];?`,
    "m"
  );
  const anyModuleImportMatch = anyImportRegex.exec(fullText);

  if (anyModuleImportMatch) {
    return {
      hasNamedImport: false,
      importedNames: [],
      insertPosition: document.positionAt(anyModuleImportMatch.index)
    };
  }

  return {
    hasNamedImport: false,
    importedNames: [],
    insertPosition: getImportInsertionPosition(document)
  };
}

function getImportInsertionPosition(document) {
  const fullText = document.getText();
  const importRegex = /^import\s.+(?:\r?\n|$)/gm;
  let match = importRegex.exec(fullText);
  let lastMatch = null;

  while (match) {
    lastMatch = match;
    match = importRegex.exec(fullText);
  }

  if (!lastMatch) {
    return new vscode.Position(0, 0);
  }

  return document.positionAt(lastMatch.index + lastMatch[0].length);
}

function buildNamedImport(fullImport, namesToEnsure, moduleName) {
  const statement = getNamedImportStatements({
    getText() {
      return fullImport;
    },
    positionAt(offset) {
      return new vscode.Position(0, offset);
    }
  })[0];

  if (!statement) {
    return fullImport;
  }

  return buildNamedImportStatement(
    moduleName,
    Array.from(new Set([...namesToEnsure, ...statement.importedNames])),
    {
      defaultImport: statement.defaultImport,
      isTypeOnly: statement.isTypeOnly
    }
  );
}

function buildNamedImportStatement(
  moduleName,
  importedNames,
  options = {}
) {
  const uniqueNames = Array.from(new Set(importedNames)).filter(Boolean);
  const defaultImport = options.defaultImport || "";
  const defaultSegment = defaultImport ? `${defaultImport}, ` : "";
  const typeSegment = options.isTypeOnly ? "type " : "";

  return `import ${typeSegment}${defaultSegment}{ ${uniqueNames.join(", ")} } from '${moduleName}';`;
}

function getConflictingNamedImportEdits(document, moduleName, namesToEnsure) {
  const targetNames = new Set(namesToEnsure);

  return getNamedImportStatements(document)
    .filter((statement) => statement.source && statement.source !== moduleName)
    .flatMap((statement) => {
      const remainingImportedNames = statement.importedNames.filter(
        (name) => !targetNames.has(name)
      );

      if (remainingImportedNames.length === statement.importedNames.length) {
        return [];
      }

      if (!remainingImportedNames.length && !statement.defaultImport) {
        return [vscode.TextEdit.replace(statement.range, "")];
      }

      return [
        vscode.TextEdit.replace(
          statement.range,
          buildNamedImportStatement(statement.source, remainingImportedNames, {
            defaultImport: statement.defaultImport,
            isTypeOnly: statement.isTypeOnly
          })
        )
      ];
    });
}

function getNamedImportEdits(document, moduleName, namesToEnsure) {
  const uniqueNames = Array.from(new Set(namesToEnsure)).filter(Boolean);

  if (!uniqueNames.length) {
    return [];
  }

  const importInfo = getNamedImportInfo(document, moduleName);
  const cleanupEdits = getConflictingNamedImportEdits(
    document,
    moduleName,
    uniqueNames
  );
  const missingNames = uniqueNames.filter(
    (name) => !importInfo.importedNames.includes(name)
  );

  if (!missingNames.length) {
    return cleanupEdits;
  }

  if (importInfo.hasNamedImport) {
    return [
      ...cleanupEdits,
      vscode.TextEdit.replace(
        importInfo.range,
        buildNamedImport(importInfo.fullImport, uniqueNames, moduleName)
      )
    ];
  }

  return [
    ...cleanupEdits,
    vscode.TextEdit.insert(
      importInfo.insertPosition,
      `${buildNamedImportStatement(moduleName, uniqueNames)}\n`
    )
  ];
}

function getImportEdits(document, imports) {
  const importsBySource = new Map();

  imports.forEach(({ source, names }) => {
    if (!source || !Array.isArray(names) || !names.length) {
      return;
    }

    const existingNames = importsBySource.get(source) || new Set();
    names.forEach((name) => existingNames.add(name));
    importsBySource.set(source, existingNames);
  });

  return Array.from(importsBySource.entries()).flatMap(([source, names]) =>
    getNamedImportEdits(document, source, Array.from(names))
  );
}

function getStyleSheetImportEdits(document) {
  return getNamedImportEdits(document, "react-native", ["StyleSheet"]);
}

function buildNewStyleSheetBlock(document, ruleName) {
  return buildNewStyleSheetBlockWithRules(document, [ruleName]);
}

function buildNewStyleSheetBlockWithRules(document, ruleNames) {
  const fullText = document.getText();
  const hasContent = fullText.trim().length > 0;
  const prefix = hasContent
    ? fullText.endsWith("\n")
      ? "\n"
      : "\n\n"
    : "";

  return (
    `${prefix}const styles = StyleSheet.create({\n` +
    ruleNames
      .map((ruleName) => `  ${ruleName}: {},\n`)
      .join("") +
    `});\n`
  );
}

function getNewStyleSheetInfo(document) {
  return {
    document,
    exists: false,
    insertPosition: new vscode.Position(
      document.lineCount - 1,
      document.lineAt(document.lineCount - 1).text.length
    ),
    ruleNames: []
  };
}

function getStyleReferenceInsertionContext(document, position, wordRange) {
  const wordStart = wordRange ? wordRange.start : position;
  const linePrefix = document.getText(
    new vscode.Range(new vscode.Position(position.line, 0), wordStart)
  );
  const invalidPrefixMatch =
    /(StyleSheet\.styles\.|StyleSheet\.)\s*$/.exec(linePrefix);

  if (invalidPrefixMatch) {
    return {
      insertText(ruleName) {
        return `styles.${ruleName}`;
      },
      range: new vscode.Range(
        new vscode.Position(
          position.line,
          linePrefix.length - invalidPrefixMatch[0].length
        ),
        wordRange ? wordRange.end : position
      )
    };
  }

  if (/styles\.\s*$/.test(linePrefix)) {
    return {
      insertText(ruleName) {
        return ruleName;
      },
      range: wordRange || new vscode.Range(position, position)
    };
  }

  return {
    insertText(ruleName) {
      return `styles.${ruleName}`;
    },
    range: wordRange || new vscode.Range(position, position)
  };
}

function createStyleReferenceCompletion(
  ruleName,
  range,
  insertText
) {
  const item = new vscode.CompletionItem(
    `styles.${ruleName}`,
    vscode.CompletionItemKind.Variable
  );

  item.detail = "React Native style reference";
  item.filterText = ruleName;
  item.sortText = `1-${ruleName}`;
  item.range = range;
  item.insertText = insertText;
  item.preselect = true;

  return item;
}

function createStyleRuleCompletion(
  ruleName,
  range,
  styleSheetInfo,
  insertText
) {
  const item = new vscode.CompletionItem(
    `Create styles.${ruleName}`,
    vscode.CompletionItemKind.Snippet
  );

  item.detail = "Create a new style rule in StyleSheet.create";
  item.documentation = new vscode.MarkdownString(
    styleSheetInfo.exists
      ? `Inserts \`styles.${ruleName}\` and creates \`${ruleName}: {}\` in \`StyleSheet.create\`.`
      : `Inserts \`styles.${ruleName}\`, adds \`StyleSheet\` to imports if needed, and creates a new \`StyleSheet.create\` block.`
  );
  item.filterText = ruleName;
  item.sortText = `0-${ruleName}`;
  item.range = range;
  item.insertText = insertText;
  item.preselect = true;
  item.additionalTextEdits = styleSheetInfo.exists
    ? [
        vscode.TextEdit.replace(
          styleSheetInfo.insertRange,
          buildStyleRulesText([ruleName], styleSheetInfo)
        )
      ]
    : [
        ...getStyleSheetImportEdits(styleSheetInfo.document),
        vscode.TextEdit.insert(
          styleSheetInfo.insertPosition,
          buildNewStyleSheetBlock(styleSheetInfo.document, ruleName)
        )
      ];

  return item;
}

function getStyleReferenceCompletions(document, position, wordRange) {
  if (!isInsideStyleReferenceContext(document, position)) {
    return [];
  }

  if (!isLikelyStyleReferencePosition(document, position, wordRange)) {
    return [];
  }

  const fallbackRange = new vscode.Range(position, position);
  const currentWord = getWordValue(document, wordRange);
  const normalizedWord = currentWord.toLowerCase();
  const insertionContext = getStyleReferenceInsertionContext(
    document,
    position,
    wordRange
  );
  const range = insertionContext.range || wordRange || fallbackRange;
  const styleSheetInfo =
    getStyleSheetInfo(document, position) || getNewStyleSheetInfo(document);
  const existingRuleNames = styleSheetInfo.ruleNames || [];
  const propName = getCurrentJsxPropName(document, position);
  const defaultRuleName = getSuggestedStyleRuleName(document, position, propName);
  const completions = existingRuleNames
    .filter(
      (ruleName) =>
        !normalizedWord || ruleName.toLowerCase().startsWith(normalizedWord)
    )
    .map((ruleName) =>
      createStyleReferenceCompletion(
        ruleName,
        range,
        insertionContext.insertText(ruleName)
      )
    );

  if (
    isValidStyleRuleName(currentWord) &&
    !existingRuleNames.includes(currentWord)
  ) {
    completions.unshift(
      createStyleRuleCompletion(
        currentWord,
        range,
        styleSheetInfo,
        insertionContext.insertText(currentWord)
      )
    );
  }

  if (!currentWord && defaultRuleName) {
    if (existingRuleNames.includes(defaultRuleName)) {
      completions.unshift(
        createStyleReferenceCompletion(
          defaultRuleName,
          range,
          insertionContext.insertText(defaultRuleName)
        )
      );
    } else {
      completions.unshift(
        createStyleRuleCompletion(
          defaultRuleName,
          range,
          styleSheetInfo,
          insertionContext.insertText(defaultRuleName)
        )
      );
    }
  }

  return completions;
}

function createStyledSnippetCompletion(prefix, range, snippetConfig, document) {
  const item = new vscode.CompletionItem(
    prefix,
    vscode.CompletionItemKind.Snippet
  );
  const styleSheetInfo =
    getStyleSheetInfo(document, range.start) || getNewStyleSheetInfo(document);
  const uniqueRuleNames = getUniqueRuleNames(
    snippetConfig.rules,
    styleSheetInfo.ruleNames || []
  );
  const missingRules = uniqueRuleNames.filter(
    (ruleName) => !styleSheetInfo.ruleNames.includes(ruleName)
  );

  item.detail = snippetConfig.detail;
  item.sortText = `0-${prefix}`;
  item.filterText = prefix;
  item.range = range;
  const primaryRuleName = uniqueRuleNames[0] || null;
  const shouldInlinePrimaryRuleName =
    snippetConfig.rules.length === 1 &&
    snippetConfig.rulePlaceholders &&
    snippetConfig.rulePlaceholders.length === 1;
  item.insertText = new vscode.SnippetString(
    buildStyledSnippetBody(
      snippetConfig,
      uniqueRuleNames,
      shouldInlinePrimaryRuleName
    )
  );

  if (primaryRuleName) {
    item.command = {
      command: "reactNativeSnippetLab.selectInsertedStyleRule",
      title: "Select inserted style rule",
      arguments: [primaryRuleName]
    };
  }

  const requiredImports = [...(snippetConfig.imports || [])];

  if (!styleSheetInfo.exists && missingRules.length) {
    requiredImports.push({
      source: "react-native",
      names: ["StyleSheet"]
    });
  }

  const additionalTextEdits = [
    ...getImportEdits(document, requiredImports),
    ...getStyledSnippetHandlerEdits(document, range.start, snippetConfig)
  ];

  if (missingRules.length) {
    additionalTextEdits.push(
      styleSheetInfo.exists
        ? vscode.TextEdit.replace(
            styleSheetInfo.insertRange,
            buildStyleRulesText(missingRules, styleSheetInfo)
          )
        : vscode.TextEdit.insert(
            styleSheetInfo.insertPosition,
            buildNewStyleSheetBlockWithRules(document, uniqueRuleNames)
          )
    );
  }

  if (additionalTextEdits.length) {
    item.additionalTextEdits = additionalTextEdits;
  }

  return item;
}

function getUniqueRuleNames(baseRuleNames, existingRuleNames) {
  const usedNames = new Set(existingRuleNames);

  return baseRuleNames.map((baseName) => {
    let candidate = baseName;
    let suffix = 2;

    while (usedNames.has(candidate)) {
      candidate = `${baseName}${suffix}`;
      suffix += 1;
    }

    usedNames.add(candidate);

    return candidate;
  });
}

function buildStyledSnippetBody(
  snippetConfig,
  uniqueRuleNames,
  inlineRuleNames = false
) {
  let body = snippetConfig.body.join("\n");

  if (!snippetConfig.rulePlaceholders) {
    return body;
  }

  snippetConfig.rulePlaceholders.forEach((placeholder, index) => {
    const uniqueRuleName = uniqueRuleNames[index];
    const token = `\$\{${placeholder.index}:${placeholder.name}\}`;

    body = body
      .split(token)
      .join(
        inlineRuleNames
          ? uniqueRuleName
          : `\$\{${placeholder.index}:${uniqueRuleName}\}`
      );
  });

  return body;
}

function getStyledSnippetHandlerEdits(document, position, snippetConfig) {
  if (
    !snippetConfig.handlerPlaceholders ||
    !snippetConfig.handlerPlaceholders.length
  ) {
    return [];
  }

  const componentInfo = findEnclosingComponentInfo(document, position);

  if (!componentInfo) {
    return [];
  }

  const declaredFunctionNames = new Set(
    getDeclaredFunctionNames(componentInfo.bodyText)
  );

  return snippetConfig.handlerPlaceholders
    .filter((placeholder) => !declaredFunctionNames.has(placeholder.name))
    .map((placeholder) =>
      vscode.TextEdit.insert(
        componentInfo.insertPosition,
        (
          placeholder.text ||
          getHandlerTemplate(placeholder.propName).text
        )(placeholder.name, componentInfo.indentation)
      )
    );
}

function getStyledSnippetCompletions(document, position, wordRange) {
  const currentWord = getWordValue(document, wordRange).toLowerCase();

  if (!currentWord) {
    return [];
  }

  if (!findEnclosingComponentInfo(document, position)) {
    return [];
  }

  const fallbackRange = new vscode.Range(position, position);
  const range = wordRange || fallbackRange;

  return Object.entries(STYLED_COMPONENT_SNIPPETS)
    .filter(([prefix]) => prefix.startsWith(currentWord))
    .map(([prefix, snippetConfig]) =>
      createStyledSnippetCompletion(prefix, range, snippetConfig, document)
    );
}

async function selectInsertedStyleRule(ruleName) {
  if (!ruleName) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 0));

  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const document = editor.document;
  const styleSheetInfo = getStyleSheetInfo(document, editor.selection.active);

  if (!styleSheetInfo) {
    return;
  }

  const styleRuleRanges = styleSheetInfo.rules
    .filter((rule) => rule.name === ruleName)
    .map((rule) =>
      new vscode.Range(
        document.positionAt(rule.startOffset),
        document.positionAt(rule.endOffset)
      )
    );
  const referenceRanges = getStyleReferenceRanges(document, ruleName);
  const ranges = [...referenceRanges, ...styleRuleRanges];

  if (!ranges.length) {
    return;
  }

  editor.selections = ranges.map(
    (range) => new vscode.Selection(range.start, range.end)
  );
  editor.revealRange(ranges[0], vscode.TextEditorRevealType.InCenterIfOutsideViewport);
}

function findEnclosingComponentInfo(document, position) {
  const fullText = document.getText();
  const cursorOffset = document.offsetAt(position);
  const declarationPatterns = [
    /(?:export\s+default\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\([^)]*\)\s*\{/g,
    /(?:export\s+)?const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/g
  ];
  let selectedComponent = null;

  declarationPatterns.forEach((pattern) => {
    let match = pattern.exec(fullText);

    while (match) {
      const openingBraceIndex = match.index + match[0].lastIndexOf("{");
      const closingBraceIndex = findMatchingClosingBrace(fullText, openingBraceIndex);

      if (
        closingBraceIndex > cursorOffset &&
        openingBraceIndex < cursorOffset &&
        (!selectedComponent || openingBraceIndex > selectedComponent.openingBraceIndex)
      ) {
        selectedComponent = {
          closingBraceIndex,
          openingBraceIndex
        };
      }

      match = pattern.exec(fullText);
    }
  });

  if (!selectedComponent) {
    return null;
  }

  const bodyText = fullText.slice(
    selectedComponent.openingBraceIndex + 1,
    selectedComponent.closingBraceIndex
  );
  const returnMatch = /^\s*return\b/m.exec(bodyText);
  const insertOffset =
    returnMatch && typeof returnMatch.index === "number"
      ? selectedComponent.openingBraceIndex + 1 + returnMatch.index
      : selectedComponent.closingBraceIndex;
  const insertPosition = document.positionAt(insertOffset);
  const insertLine = document.lineAt(insertPosition.line);
  const indentation = insertLine.text.match(/^\s*/)[0] || "  ";

  return {
    bodyText,
    indentation,
    insertPosition
  };
}

function getDeclaredFunctionNames(componentBody) {
  const names = new Set();
  const patterns = [
    /(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][A-Za-z0-9_$]*)\s*=>/g,
    /function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g
  ];

  patterns.forEach((pattern) => {
    let match = pattern.exec(componentBody);

    while (match) {
      names.add(match[1]);
      match = pattern.exec(componentBody);
    }
  });

  return Array.from(names);
}

function getHandlerTemplate(propName) {
  switch (propName) {
    case "onChangeText":
      return {
        detail: "Create a text change handler",
        documentation:
          "Creates a handler with a `value` parameter for `onChangeText`.",
        text: (handlerName, indentation) =>
          `\n${indentation}const ${handlerName} = (value) => {\n` +
          `${indentation}  \n` +
          `${indentation}};\n\n`
      };
    case "renderItem":
      return {
        detail: "Create a FlatList renderItem handler",
        documentation:
          "Creates a `renderItem` helper with `{ item, index }` parameters.",
        text: (handlerName, indentation) =>
          `\n${indentation}const ${handlerName} = ({ item, index }) => {\n` +
          `${indentation}  return null;\n` +
          `${indentation}};\n\n`
      };
    case "keyExtractor":
      return {
        detail: "Create a FlatList keyExtractor handler",
        documentation:
          "Creates a `keyExtractor` helper with `item` and `index` parameters.",
        text: (handlerName, indentation) =>
          `\n${indentation}const ${handlerName} = (item, index) => {\n` +
          `${indentation}  return item.id?.toString() ?? String(index);\n` +
          `${indentation}};\n\n`
      };
    case "ListEmptyComponent":
    case "ListHeaderComponent":
    case "ListFooterComponent":
    case "ItemSeparatorComponent":
      return {
        detail: `Create a ${propName} helper`,
        documentation:
          `Creates a component helper suitable for \`${propName}\`.`,
        text: (handlerName, indentation) =>
          `\n${indentation}const ${handlerName} = () => {\n` +
          `${indentation}  return null;\n` +
          `${indentation}};\n\n`
      };
    case "renderSectionHeader":
    case "renderSectionFooter":
      return {
        detail: `Create a ${propName} helper`,
        documentation:
          `Creates a section renderer with a \`section\` parameter for \`${propName}\`.`,
        text: (handlerName, indentation) =>
          `\n${indentation}const ${handlerName} = ({ section }) => {\n` +
          `${indentation}  return null;\n` +
          `${indentation}};\n\n`
      };
    default:
      return {
        detail: "Create a new handler in this component",
        documentation:
          "Creates a component handler before the component return.",
        text: (handlerName, indentation) =>
          `\n${indentation}const ${handlerName} = () => {\n` +
          `${indentation}  \n` +
          `${indentation}};\n\n`
      };
  }
}

function createHandlerReferenceCompletion(handlerName, range) {
  const item = new vscode.CompletionItem(
    handlerName,
    vscode.CompletionItemKind.Function
  );

  item.detail = "Component handler";
  item.filterText = handlerName;
  item.sortText = `1-${handlerName}`;
  item.range = range;
  item.insertText = handlerName;

  return item;
}

function createHandlerCreationCompletion(
  handlerName,
  range,
  componentInfo,
  propName
) {
  const item = new vscode.CompletionItem(
    `Create ${handlerName}`,
    vscode.CompletionItemKind.Snippet
  );
  const template = getHandlerTemplate(propName);

  item.detail = template.detail;
  item.documentation = new vscode.MarkdownString(
    `Inserts \`${handlerName}\` and creates a helper before the component return.\n\n${template.documentation}`
  );
  item.filterText = handlerName;
  item.sortText = `0-${handlerName}`;
  item.range = range;
  item.insertText = handlerName;
  item.additionalTextEdits = [
    vscode.TextEdit.insert(
      componentInfo.insertPosition,
      template.text(handlerName, componentInfo.indentation)
    )
  ];

  return item;
}

function createSpecialColorValueCompletions(propName, range) {
  const items = [
    {
      label: "#hex",
      insertText: new vscode.SnippetString("'${1:#9CA3AF}'"),
      detail: `Insert a hex color for ${propName}`
    },
    {
      label: "rgba",
      insertText: new vscode.SnippetString(
        "'rgba(${1:0}, ${2:0}, ${3:0}, ${4:0.35})'"
      ),
      detail: `Insert an rgba color for ${propName}`
    },
    {
      label: "transparent",
      insertText: "'transparent'",
      detail: `Insert transparent for ${propName}`
    }
  ];

  return items.map((entry, index) => {
    const item = new vscode.CompletionItem(
      entry.label,
      vscode.CompletionItemKind.Value
    );

    item.detail = entry.detail;
    item.sortText = `0-${index}-${entry.label}`;
    item.range = range;
    item.insertText = entry.insertText;

    return item;
  });
}

function getSpecialJsxPropValueCompletions(document, position, wordRange) {
  const propName = getCurrentJsxPropName(document, position);

  if (!propName || !SPECIAL_COLOR_VALUE_PROPS.has(propName)) {
    return [];
  }

  const fallbackRange = new vscode.Range(position, position);
  const range = wordRange || fallbackRange;

  return createSpecialColorValueCompletions(propName, range);
}

function getHandlerReferenceCompletions(document, position, wordRange) {
  if (!isInsideHandlerReferenceContext(document, position)) {
    return [];
  }

  if (!isLikelyHandlerReferencePosition(document, position, wordRange)) {
    return [];
  }

  const componentInfo = findEnclosingComponentInfo(document, position);

  if (!componentInfo) {
    return [];
  }

  const fallbackRange = new vscode.Range(position, position);
  const range = wordRange || fallbackRange;
  const currentWord = getWordValue(document, wordRange);
  const normalizedWord = currentWord.toLowerCase();
  const propName = getCurrentJsxPropName(document, position);
  const declaredFunctionNames = getDeclaredFunctionNames(componentInfo.bodyText);
  const completions = declaredFunctionNames
    .filter(
      (name) => !normalizedWord || name.toLowerCase().startsWith(normalizedWord)
    )
    .map((name) => createHandlerReferenceCompletion(name, range));

  if (
    isValidStyleRuleName(currentWord) &&
    !declaredFunctionNames.includes(currentWord)
  ) {
    completions.unshift(
      createHandlerCreationCompletion(
        currentWord,
        range,
        componentInfo,
        propName
      )
    );
  }

  return completions;
}

function getStyleReferenceRanges(document, ruleName) {
  const fullText = document.getText();
  const regex = new RegExp(`styles\\.${ruleName}\\b`, "g");
  const ranges = [];
  let match = regex.exec(fullText);

  while (match) {
    const startOffset = match.index + "styles.".length;
    ranges.push(
      new vscode.Range(
        document.positionAt(startOffset),
        document.positionAt(startOffset + ruleName.length)
      )
    );
    match = regex.exec(fullText);
  }

  return ranges;
}

function getStyleRuleNameAtPosition(document, position) {
  const identifierRange = document.getWordRangeAtPosition(
    position,
    /[A-Za-z_$][A-Za-z0-9_$]*/
  );

  if (!identifierRange) {
    return null;
  }

  const identifier = document.getText(identifierRange);
  const styleSheetInfo = getStyleSheetInfo(document, position);

  if (!styleSheetInfo) {
    return null;
  }

  const isRuleKey = styleSheetInfo.rules.some(
    (rule) =>
      document.offsetAt(identifierRange.start) === rule.startOffset &&
      document.offsetAt(identifierRange.end) === rule.endOffset
  );

  if (isRuleKey) {
    return identifier;
  }

  const linePrefix = document.getText(
    new vscode.Range(
      new vscode.Position(position.line, 0),
      identifierRange.start
    )
  );

  if (/styles\.\s*$/.test(linePrefix)) {
    return identifier;
  }

  return null;
}

function createLinkedEditingProvider() {
  return {
    provideLinkedEditingRanges(document, position) {
      const styleRuleName = getStyleRuleNameAtPosition(document, position);

      if (!styleRuleName) {
        return null;
      }

      const styleSheetInfo = getStyleSheetInfo(document, position);

      if (!styleSheetInfo) {
        return null;
      }

      const styleRuleRanges = styleSheetInfo.rules
        .filter((rule) => rule.name === styleRuleName)
        .map((rule) =>
          new vscode.Range(
            document.positionAt(rule.startOffset),
            document.positionAt(rule.endOffset)
          )
        );
      const referenceRanges = getStyleReferenceRanges(document, styleRuleName);
      const ranges = [...styleRuleRanges, ...referenceRanges];

      if (ranges.length < 2) {
        return null;
      }

      return new vscode.LinkedEditingRanges(
        ranges,
        /[A-Za-z_$][A-Za-z0-9_$]*/
      );
    }
  };
}

function createTypeAliasCodeActionProvider() {
  return {
    provideCodeActions(document, range) {
      return getTypeAliasCodeActions(document, range);
    }
  };
}

function createReactNativeProductivityCodeActionProvider() {
  return {
    provideCodeActions(document, range) {
      return getReactNativeProductivityCodeActions(document, range);
    }
  };
}

function activate(context) {
  const extractInlineStyleCommand = vscode.commands.registerCommand(
    "reactNativeSnippetLab.extractInlineStyle",
    extractInlineStyleFromContext
  );
  const addMissingReactNativeImportsCommand = vscode.commands.registerCommand(
    "reactNativeSnippetLab.addMissingReactNativeImports",
    addMissingReactNativeImports
  );
  const typeObjectCommand = vscode.commands.registerCommand(
    "reactNativeSnippetLab.typeObjectFromContext",
    typeObjectFromContext
  );
  const selectInsertedStyleRuleCommand = vscode.commands.registerCommand(
    "reactNativeSnippetLab.selectInsertedStyleRule",
    selectInsertedStyleRule
  );
  const provider = vscode.languages.registerCompletionItemProvider(
    [
      { language: "javascript", scheme: "file" },
      { language: "javascriptreact", scheme: "file" },
      { language: "typescript", scheme: "file" },
      { language: "typescriptreact", scheme: "file" }
    ],
    {
      provideCompletionItems(document, position) {
        const config = getCurrentDocumentConfig(document);
        const wordRange = getCurrentWordRange(document, position);
        const styledSnippetCompletions = getStyledSnippetCompletions(
          document,
          position,
          wordRange
        );

        if (styledSnippetCompletions.length) {
          return styledSnippetCompletions;
        }

        if (isInsideHandlerReferenceContext(document, position)) {
          return getHandlerReferenceCompletions(document, position, wordRange);
        }

        const specialJsxPropValueCompletions =
          getSpecialJsxPropValueCompletions(document, position, wordRange);

        if (specialJsxPropValueCompletions.length) {
          return specialJsxPropValueCompletions;
        }

        if (isInsideStyleReferenceContext(document, position)) {
          return getStyleReferenceCompletions(document, position, wordRange);
        }

        if (!isInsideStyleContext(document, position)) {
          return [];
        }

        if (!isLikelyStylePropertyPosition(document, position, wordRange)) {
          return [];
        }

        if (!config.get("enableStyleAliases", true)) {
          return [];
        }

        const styleAliasWordRange =
          getStyleAliasWordRange(document, position) || wordRange;
        const fallbackRange = new vscode.Range(position, position);
        const range = styleAliasWordRange || fallbackRange;
        const currentWord = styleAliasWordRange
          ? document.getText(styleAliasWordRange).toLowerCase()
          : "";

        const valueAliasCompletions = Object.entries(STYLE_VALUE_ALIASES)
          .filter(([alias]) => !currentWord || alias.startsWith(currentWord))
          .map(([alias, entry]) =>
            createStyleValueAliasCompletion(
              alias,
              entry.propertyName,
              entry.value,
              range
            )
          );
        const propertyAliasCompletions = Object.entries(STYLE_ALIASES)
          .filter(([alias]) => !currentWord || alias.startsWith(currentWord))
          .map(([alias, propertyName]) =>
            createStyleAliasCompletion(alias, propertyName, range)
          );
        const completions = [
          ...valueAliasCompletions,
          ...propertyAliasCompletions
        ];

        return completions;
      }
    },
    "."
  );
  const linkedEditingProvider = vscode.languages.registerLinkedEditingRangeProvider(
    [
      { language: "javascript", scheme: "file" },
      { language: "javascriptreact", scheme: "file" },
      { language: "typescript", scheme: "file" },
      { language: "typescriptreact", scheme: "file" }
    ],
    createLinkedEditingProvider()
  );
  const typeAliasCodeActionProvider = vscode.languages.registerCodeActionsProvider(
    [
      { language: "typescript", scheme: "file" },
      { language: "typescriptreact", scheme: "file" }
    ],
    createTypeAliasCodeActionProvider(),
    {
      providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    }
  );
  const reactNativeProductivityCodeActionProvider =
    vscode.languages.registerCodeActionsProvider(
      [
        { language: "javascript", scheme: "file" },
        { language: "javascriptreact", scheme: "file" },
        { language: "typescript", scheme: "file" },
        { language: "typescriptreact", scheme: "file" }
      ],
      createReactNativeProductivityCodeActionProvider(),
      {
        providedCodeActionKinds: [
          vscode.CodeActionKind.QuickFix,
          vscode.CodeActionKind.RefactorExtract
        ]
      }
    );
  const textChangeListener = vscode.workspace.onDidChangeTextDocument((event) => {
    const uriKey = event.document.uri.toString();

    if (internalTypeSyncUpdates.has(uriKey)) {
      return;
    }

    if (!event.contentChanges.length) {
      return;
    }

    scheduleTypeAliasSync(event.document);
    scheduleUnusedStyleRuleCleanup(event.document);
  });
  const closeDocumentListener = vscode.workspace.onDidCloseTextDocument((document) => {
    const uriKey = document.uri.toString();
    const existingTimer = typeSyncTimers.get(uriKey);
    const existingCleanupTimer = styleCleanupTimers.get(uriKey);

    if (existingTimer) {
      clearTimeout(existingTimer);
      typeSyncTimers.delete(uriKey);
    }

    if (existingCleanupTimer) {
      clearTimeout(existingCleanupTimer);
      styleCleanupTimers.delete(uriKey);
    }

    internalTypeSyncUpdates.delete(uriKey);
  });

  context.subscriptions.push(provider);
  context.subscriptions.push(linkedEditingProvider);
  context.subscriptions.push(typeAliasCodeActionProvider);
  context.subscriptions.push(reactNativeProductivityCodeActionProvider);
  context.subscriptions.push(textChangeListener);
  context.subscriptions.push(closeDocumentListener);
  context.subscriptions.push(extractInlineStyleCommand);
  context.subscriptions.push(addMissingReactNativeImportsCommand);
  context.subscriptions.push(typeObjectCommand);
  context.subscriptions.push(selectInsertedStyleRuleCommand);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
