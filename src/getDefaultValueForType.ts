import { SyntaxKind, ts, Type, TypeNode } from "ts-morph";
import { getFunctionName, getSymbolName } from "./names";
import { NAME_PREFIX } from "./const";

type SimpleValue = string | number | boolean;

type DefaultValue<T> = T | (() => T) | T[] | null;
type AnyDefaultValue = DefaultValue<SimpleValue>;

type DefaultValueParams =
  | AnyDefaultValue
  | { [key: string]: DefaultValueParams };

let counter = 0;
const getIncrementalId = () => String(counter++);

const DEFAULT_VALUES: Record<string, DefaultValueParams> = {
  id: getIncrementalId,
};

type ResolvedDefaultValue = { type: "simple"; value: SimpleValue };

const getDefaultValueFromSettings = (
  name: string
): ResolvedDefaultValue | undefined => {
  const valueOrFn = DEFAULT_VALUES[name];

  switch (typeof valueOrFn) {
    case "boolean":
    case "number":
    case "string":
      return { type: "simple", value: valueOrFn };
    case "function":
      return { type: "simple", value: valueOrFn() };
  }
};

export function getDefaultValueForType(
  allExportedNames: Set<string>,
  fieldName: string,
  type: Type,
  typeNode?: TypeNode
): string {
  const resolved = getDefaultValueFromSettings(fieldName);

  // литеральные типы 
  if (type.isStringLiteral() || type.isNumberLiteral()) {
    const value = type.getLiteralValue();
    return JSON.stringify(value);
  } else if (type.isBooleanLiteral()) {
    return type.getText();
  } 
  
  else if (type.isString()) {
    if (resolved && typeof resolved.value !== "string") throw new Error();
    return JSON.stringify(resolved?.value || "");
  } else if (type.isNumber()) {
    if (resolved && typeof resolved.value !== "number") throw new Error();
    return JSON.stringify(resolved?.value || 0);
  } else if (type.isBoolean()) {
    if (resolved && typeof resolved.value !== "boolean") throw new Error();
    return JSON.stringify(resolved?.value || false);
  } else if (type.isInterface() || type.isObject()) {
    const name = getSymbolName(type);

    if (name && allExportedNames.has(name)) {
      return `${getFunctionName(name)}()`;
    }

    return getDefaultValueForObjectType(allExportedNames, type);
  } else if (type.isArray()) {
    return "[]";
  } else if (type.isNull()) {
    return "null";
  } else if (type.isUndefined()) {
    return "undefined";
  } else if (type.isEnum()) {
    // Для enum берем первое значение или 0
    const enumMembers = type
      .getSymbol()
      ?.getDeclarations()?.[0]
      ?.getSourceFile()
      .getDescendantsOfKind(SyntaxKind.EnumMember);
    if (enumMembers && enumMembers.length > 0) {
      const enumName = type.getSymbol()?.getName();
      const firstMemberName = enumMembers[0].getName();
      return `${enumName}.${firstMemberName}`;
    }
    return "0";
  } else if (type.isUnion()) {
    // Для union типов берем первый вариант
    const unionTypes = type.getUnionTypes();
    if (unionTypes.length > 0) {
      return getDefaultValueForType(allExportedNames, fieldName, unionTypes[0]);
    }
    return "undefined";
  } else if (typeNode && typeNode.getKind() === SyntaxKind.TypeLiteral) {
    // Для встроенных литеральных типов
    return "{}";
  } else {
    // Для всех остальных типов
    return "undefined";
  }
}

export function getDefaultValueForObjectType(
  allExportedNames: Set<string>,
  type: Type<ts.ObjectType>
): string {
  const fields: string[] = [];

  console.log(`обработка типа: ${type}`);

  const props = type.getProperties();

  for (const p of props) {
    const name = p.getName();
    const decl = p.getValueDeclaration();
    const innerType = decl.getType();

    console.log(`  обработка поля: ${name}`);

    const defaultValue = getDefaultValueForType(
      allExportedNames,
      name,
      innerType
    );

    fields.push(`${name}: ${defaultValue}`);
  }

  return `{${fields.join(",")}}`;
}
