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
  return document.getWordRangeAtPosition(position, /[A-Za-z]+/);
}

function hasUnclosedBrace(text, openingBraceIndex) {
  let depth = 0;

  for (let index = openingBraceIndex; index < text.length; index += 1) {
    const character = text[index];

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
    }
  }

  return depth > 0;
}

function findLastOpenBraceForPattern(text, pattern) {
  const regex = new RegExp(pattern.source, `${pattern.flags}g`);
  let match = regex.exec(text);
  let lastOpenBraceIndex = -1;

  while (match) {
    const openingBraceOffset = match[0].lastIndexOf("{");
    const openingBraceIndex = match.index + openingBraceOffset;

    if (hasUnclosedBrace(text, openingBraceIndex)) {
      lastOpenBraceIndex = openingBraceIndex;
    }

    match = regex.exec(text);
  }

  return lastOpenBraceIndex;
}

function isInsideStyleContext(document, position) {
  const textBeforeCursor = document.getText(
    new vscode.Range(new vscode.Position(0, 0), position)
  );
  const inlineStyleBraceIndex = findLastOpenBraceForPattern(
    textBeforeCursor,
    /style\s*=\s*\{\s*\{/i
  );
  const styleSheetBraceIndex = findLastOpenBraceForPattern(
    textBeforeCursor,
    /StyleSheet\.create\s*\(\s*\{/i
  );

  return inlineStyleBraceIndex >= 0 || styleSheetBraceIndex >= 0;
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

  return !/:\s*[^,]*$/.test(trimmedLinePrefix);
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
    }
  );

  context.subscriptions.push(provider);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
