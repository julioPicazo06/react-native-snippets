const vscode = require("vscode");

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

function getCurrentWordRange(document, position) {
  return document.getWordRangeAtPosition(
    position,
    /[A-Za-z_$][A-Za-z0-9_$]*/
  );
}

function getWordValue(document, wordRange) {
  return wordRange ? document.getText(wordRange) : "";
}

function endsWithStylePropAssignment(text) {
  return /\b(?:[A-Za-z][A-Za-z0-9_]*)?Style\s*=\s*$/i.test(text);
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

function findMatchingClosingBrace(text, openingBraceIndex) {
  let depth = 0;

  for (let index = openingBraceIndex; index < text.length; index += 1) {
    const character = text[index];

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function getTopLevelStyleRuleNames(styleSheetBody) {
  const ruleNames = [];
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
        ruleNames.push(ruleName);
      }

      index = cursor;
      continue;
    }

    index += 1;
  }

  return ruleNames;
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

function getStyleSheetInfo(document) {
  const fullText = document.getText();
  const match = /StyleSheet\.create\s*\(\s*\{/.exec(fullText);

  if (!match) {
    return null;
  }

  const openingBraceIndex = match.index + match[0].lastIndexOf("{");
  const closingBraceIndex = findMatchingClosingBrace(fullText, openingBraceIndex);

  if (closingBraceIndex < 0) {
    return null;
  }

  const styleSheetBody = fullText.slice(
    openingBraceIndex + 1,
    closingBraceIndex
  );
  const indentation = getStyleRuleIndentation(
    document,
    openingBraceIndex,
    styleSheetBody
  );

  return {
    indentation,
    innerIndentation: `${indentation}  `,
    insertPosition: document.positionAt(closingBraceIndex),
    ruleNames: getTopLevelStyleRuleNames(styleSheetBody),
    exists: true
  };
}

function buildStyleRuleText(ruleName, styleSheetInfo) {
  return (
    `${styleSheetInfo.indentation}${ruleName}: {\n` +
    `${styleSheetInfo.innerIndentation}\n` +
    `${styleSheetInfo.indentation}},\n`
  );
}

function isValidStyleRuleName(value) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);
}

function getReactNativeImportInfo(document) {
  const fullText = document.getText();
  const namedImportMatch =
    /import\s*\{([\s\S]*?)\}\s*from\s*['"]react-native['"];?/m.exec(fullText);

  if (namedImportMatch) {
    return {
      fullImport: namedImportMatch[0],
      hasNamedImport: true,
      hasStyleSheet: /\bStyleSheet\b/.test(namedImportMatch[1]),
      range: new vscode.Range(
        document.positionAt(namedImportMatch.index),
        document.positionAt(namedImportMatch.index + namedImportMatch[0].length)
      )
    };
  }

  const anyReactNativeImportMatch =
    /import\s+.*from\s*['"]react-native['"];?/m.exec(fullText);

  if (anyReactNativeImportMatch) {
    return {
      hasNamedImport: false,
      hasStyleSheet: false,
      insertPosition: document.positionAt(anyReactNativeImportMatch.index)
    };
  }

  return {
    hasNamedImport: false,
    hasStyleSheet: false,
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

function buildNamedReactNativeImport(fullImport) {
  const specifierMatch = /import\s*\{([\s\S]*?)\}\s*from\s*['"]react-native['"]/.exec(
    fullImport
  );

  if (!specifierMatch) {
    return fullImport;
  }

  const specifiers = specifierMatch[1]
    .split(",")
    .map((specifier) => specifier.trim())
    .filter(Boolean);

  if (!specifiers.includes("StyleSheet")) {
    specifiers.unshift("StyleSheet");
  }

  return fullImport.replace(
    /\{[\s\S]*?\}/,
    `{ ${specifiers.join(", ")} }`
  );
}

function getStyleSheetImportEdits(document) {
  const importInfo = getReactNativeImportInfo(document);

  if (importInfo.hasStyleSheet) {
    return [];
  }

  if (importInfo.hasNamedImport) {
    return [
      vscode.TextEdit.replace(
        importInfo.range,
        buildNamedReactNativeImport(importInfo.fullImport)
      )
    ];
  }

  return [
    vscode.TextEdit.insert(
      importInfo.insertPosition,
      `import { StyleSheet } from 'react-native';\n`
    )
  ];
}

function buildNewStyleSheetBlock(document, ruleName) {
  const fullText = document.getText();
  const hasContent = fullText.trim().length > 0;
  const prefix = hasContent
    ? fullText.endsWith("\n")
      ? "\n"
      : "\n\n"
    : "";

  return (
    `${prefix}const styles = StyleSheet.create({\n` +
    `  ${ruleName}: {\n` +
    `  },\n` +
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

function isAfterStylesDot(document, position, wordRange) {
  const wordStart = wordRange ? wordRange.start : position;
  const linePrefix = document.getText(
    new vscode.Range(new vscode.Position(position.line, 0), wordStart)
  );

  return /styles\.\s*$/.test(linePrefix);
}

function createStyleReferenceCompletion(
  ruleName,
  range,
  shouldInsertFullReference
) {
  const item = new vscode.CompletionItem(
    `styles.${ruleName}`,
    vscode.CompletionItemKind.Variable
  );

  item.detail = "React Native style reference";
  item.filterText = ruleName;
  item.sortText = `1-${ruleName}`;
  item.range = range;
  item.insertText = shouldInsertFullReference
    ? `styles.${ruleName}`
    : ruleName;

  return item;
}

function createStyleRuleCompletion(
  ruleName,
  range,
  styleSheetInfo,
  shouldInsertFullReference
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
  item.insertText = shouldInsertFullReference
    ? `styles.${ruleName}`
    : ruleName;
  item.additionalTextEdits = styleSheetInfo.exists
    ? [
        vscode.TextEdit.insert(
          styleSheetInfo.insertPosition,
          buildStyleRuleText(ruleName, styleSheetInfo)
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
  const range = wordRange || fallbackRange;
  const currentWord = getWordValue(document, wordRange);
  const normalizedWord = currentWord.toLowerCase();
  const afterStylesDot = isAfterStylesDot(document, position, wordRange);
  const shouldInsertFullReference = !afterStylesDot;
  const styleSheetInfo =
    getStyleSheetInfo(document) || getNewStyleSheetInfo(document);
  const existingRuleNames = styleSheetInfo.ruleNames || [];
  const completions = existingRuleNames
    .filter(
      (ruleName) =>
        !normalizedWord || ruleName.toLowerCase().startsWith(normalizedWord)
    )
    .map((ruleName) =>
      createStyleReferenceCompletion(
        ruleName,
        range,
        shouldInsertFullReference
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
        shouldInsertFullReference
      )
    );
  }

  return completions;
}

function activate(context) {
  const provider = vscode.languages.registerCompletionItemProvider(
    [
      { language: "javascript", scheme: "file" },
      { language: "javascriptreact", scheme: "file" },
      { language: "typescript", scheme: "file" },
      { language: "typescriptreact", scheme: "file" }
    ],
    {
      provideCompletionItems(document, position) {
        const config = vscode.workspace.getConfiguration(
          "reactNativeSnippetLab"
        );

        if (!config.get("enableStyleAliases", true)) {
          return [];
        }

        const wordRange = getCurrentWordRange(document, position);

        if (isInsideStyleReferenceContext(document, position)) {
          return getStyleReferenceCompletions(document, position, wordRange);
        }

        if (!isInsideStyleContext(document, position)) {
          return [];
        }

        if (!isLikelyStylePropertyPosition(document, position, wordRange)) {
          return [];
        }

        const fallbackRange = new vscode.Range(position, position);
        const range = wordRange || fallbackRange;
        const currentWord = wordRange
          ? document.getText(wordRange).toLowerCase()
          : "";

        const completions = Object.entries(STYLE_ALIASES)
          .filter(([alias]) => !currentWord || alias.startsWith(currentWord))
          .map(([alias, propertyName]) =>
            createStyleAliasCompletion(alias, propertyName, range)
          );

        return completions;
      }
    },
    "."
  );

  context.subscriptions.push(provider);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
