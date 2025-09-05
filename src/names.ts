import { InterfaceDeclaration, ts, TypeAliasDeclaration, Type } from "ts-morph";
import { NAME_PREFIX } from "./const";

export const getDeclarationName = (
  d: InterfaceDeclaration | TypeAliasDeclaration
): string | undefined => {
  const name = d.getName();
  return name && d.isExported() ? name : undefined;
};

export const getSymbolName = (t: Type<ts.ObjectType>): string | undefined => {
    const name = t.getSymbol()?.getName();

    return name && name !== 'Object' ? name : undefined;
};

export const getFunctionName = (typeName: string) => `${NAME_PREFIX}${typeName}`;