import {
    SyntaxKind,
    NodeFlags,
    Node,
    TypeNode,
    factory,
    FunctionDeclaration,
  } from "typescript";
  
  import { Parameter, Column, Query } from "../gen/plugin/codegen_pb";
  import { argName } from "./utlis";
  
  function funcParamsDecl(iface: string | undefined, params: Parameter[]) {
    let funcParams = [
      factory.createParameterDeclaration(
        undefined,
        undefined,
        factory.createIdentifier("db"),
        undefined,
        factory.createTypeReferenceNode(
          factory.createIdentifier("NeverChangeDB"),
          undefined
        ),
        undefined
      ),
    ];
  
    if (iface && params.length > 0) {
      funcParams.push(
        factory.createParameterDeclaration(
          undefined,
          undefined,
          factory.createIdentifier("args"),
          undefined,
          factory.createTypeReferenceNode(
            factory.createIdentifier(iface),
            undefined
          ),
          undefined
        )
      );
    }
  
    return funcParams;
  }
  
  export class Driver {
    columnType(column?: Column): TypeNode {
      if (column === undefined || column.type === undefined) {
        return factory.createKeywordTypeNode(SyntaxKind.AnyKeyword);
      }
  
      let typ: TypeNode = factory.createKeywordTypeNode(SyntaxKind.AnyKeyword);
      switch (column.type.name) {
        case "int":
        case "integer":
        case "tinyint":
        case "smallint":
        case "mediumint":
        case "bigint":
        case "unsignedbigint":
        case "int2":
        case "int8":
        case "real":
        case "double":
        case "doubleprecision":
        case "float": {
          typ = factory.createKeywordTypeNode(SyntaxKind.NumberKeyword);
          break;
        }
        case "blob": {
          typ = factory.createTypeReferenceNode(
            factory.createIdentifier("Uint8Array"),
            undefined
          );
          break;
        }
        case "boolean":
        case "bool": {
          typ = factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword);
          break;
        }
        case "date":
        case "datetime":
        case "timestamp": {
          typ = factory.createTypeReferenceNode(
            factory.createIdentifier("Date"),
            undefined
          );
          break;
        }
      }
  
      if (column.notNull) {
        return typ;
      }
  
      return factory.createUnionTypeNode([
        typ,
        factory.createLiteralTypeNode(factory.createNull()),
      ]);
    }
  
    preamble(queries: Query[]) {
      const imports: Node[] = [
        factory.createImportDeclaration(
          undefined,
          factory.createImportClause(
            false,
            undefined,
            factory.createNamedImports([
              factory.createImportSpecifier(
                false,
                undefined,
                factory.createIdentifier("NeverChangeDB")
              ),
            ])
          ),
          factory.createStringLiteral("neverchange"),
          undefined
        ),
      ];
  
      return imports;
    }
  
    execDecl(
      funcName: string,
      queryName: string,
      argIface: string | undefined,
      params: Parameter[]
    ) {
      const funcParams = funcParamsDecl(argIface, params);
  
      return factory.createFunctionDeclaration(
        [
          factory.createToken(SyntaxKind.ExportKeyword),
          factory.createToken(SyntaxKind.AsyncKeyword),
        ],
        undefined,
        factory.createIdentifier(funcName),
        undefined,
        funcParams,
        factory.createTypeReferenceNode(factory.createIdentifier("Promise"), [
          factory.createKeywordTypeNode(SyntaxKind.VoidKeyword),
        ]),
        factory.createBlock(
          [
            factory.createExpressionStatement(
              factory.createAwaitExpression(
                factory.createCallExpression(
                  factory.createPropertyAccessExpression(
                    factory.createIdentifier("db"),
                    factory.createIdentifier("execute")
                  ),
                  undefined,
                  [
                    factory.createIdentifier(queryName),
                    factory.createArrayLiteralExpression(
                      params.map((param, i) =>
                        factory.createPropertyAccessExpression(
                          factory.createIdentifier("args"),
                          factory.createIdentifier(argName(i, param.column))
                        )
                      ),
                      false
                    ),
                  ]
                )
              )
            ),
          ],
          true
        )
      );
    }
  
    oneDecl(
      funcName: string,
      queryName: string,
      argIface: string | undefined,
      returnIface: string,
      params: Parameter[],
      columns: Column[]
    ) {
      const funcParams = funcParamsDecl(argIface, params);
  
      return factory.createFunctionDeclaration(
        [
          factory.createToken(SyntaxKind.ExportKeyword),
          factory.createToken(SyntaxKind.AsyncKeyword),
        ],
        undefined,
        factory.createIdentifier(funcName),
        undefined,
        funcParams,
        factory.createTypeReferenceNode(factory.createIdentifier("Promise"), [
          factory.createUnionTypeNode([
            factory.createTypeReferenceNode(
              factory.createIdentifier(returnIface),
              undefined
            ),
            factory.createLiteralTypeNode(factory.createNull()),
          ]),
        ]),
        factory.createBlock(
          [
            factory.createVariableStatement(
              undefined,
              factory.createVariableDeclarationList(
                [
                  factory.createVariableDeclaration(
                    factory.createIdentifier("result"),
                    undefined,
                    undefined,
                    factory.createAwaitExpression(
                      factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                          factory.createIdentifier("db"),
                          factory.createIdentifier("query")
                        ),
                        undefined,
                        [
                          factory.createIdentifier(queryName),
                          factory.createArrayLiteralExpression(
                            params.map((param, i) =>
                              factory.createPropertyAccessExpression(
                                factory.createIdentifier("args"),
                                factory.createIdentifier(argName(i, param.column))
                              )
                            ),
                            false
                          ),
                        ]
                      )
                    )
                  ),
                ],
                NodeFlags.Const
              )
            ),
            factory.createReturnStatement(
              factory.createElementAccessExpression(
                factory.createIdentifier("result"),
                factory.createNumericLiteral("0")
              )
            ),
          ],
          true
        )
      );
    }
  
    manyDecl(
      funcName: string,
      queryName: string,
      argIface: string | undefined,
      returnIface: string,
      params: Parameter[],
      columns: Column[]
    ) {
      const funcParams = funcParamsDecl(argIface, params);
  
      return factory.createFunctionDeclaration(
        [
          factory.createToken(SyntaxKind.ExportKeyword),
          factory.createToken(SyntaxKind.AsyncKeyword),
        ],
        undefined,
        factory.createIdentifier(funcName),
        undefined,
        funcParams,
        factory.createTypeReferenceNode(factory.createIdentifier("Promise"), [
          factory.createArrayTypeNode(
            factory.createTypeReferenceNode(
              factory.createIdentifier(returnIface),
              undefined
            )
          ),
        ]),
        factory.createBlock(
          [
            factory.createReturnStatement(
              factory.createAwaitExpression(
                factory.createCallExpression(
                  factory.createPropertyAccessExpression(
                    factory.createIdentifier("db"),
                    factory.createIdentifier("query")
                  ),
                  undefined,
                  [
                    factory.createIdentifier(queryName),
                    factory.createArrayLiteralExpression(
                      params.map((param, i) =>
                        factory.createPropertyAccessExpression(
                          factory.createIdentifier("args"),
                          factory.createIdentifier(argName(i, param.column))
                        )
                      ),
                      false
                    ),
                  ]
                )
              )
            ),
          ],
          true
        )
      );
    }
  
    execlastidDecl(
      funcName: string,
      queryName: string,
      argIface: string | undefined,
      params: Parameter[]
    ): FunctionDeclaration {
      throw new Error(
        "NeverChange driver currently does not support :execlastid"
      );
    }
  }