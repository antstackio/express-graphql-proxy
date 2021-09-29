function parse(ast, preDefs = {}) {
  const { definitions } = ast;
  const opDef = definitions[0];
  const { operation, variableDefinitions, selectionSet } = opDef;

  const variables = parseVariableDefinition(variableDefinitions, preDefs);

  const queries = selectionSet.selections || [];

  const queryObjects = queries.map((query) => {
    const opName = query.name.value;
    const args = query.arguments || [];
    const argumentValues = parseArguments(args);
    const selectionFields = parseSelection(query.selectionSet);
    for (const key of Object.keys(argumentValues)) {
      if (variables[key]) argumentValues[key] = variables[key];
    }

    return {
      operationName: opName,
      variables: {
        ...argumentValues,
      },
      selectedFields: selectionFields,
    };
  });

  return {
    type: operation,
    queryObjects,
  };
}

function parseArguments(args) {
  const result = {};
  for (const arg of args) {
    result[arg.name.value] = arg.value.fields
      ? parseArguments(arg.value.fields)
      : arg.value.value;
  }
  return result;
}

function parseVariableDefinition(variables, def) {
  const values = {};
  for (const variable of variables) {
    const name = variable.variable.name.value;
    values[name] = def[name] || undefined;
  }

  return values;
}

function parseSelection({ selections = [] }) {
  return selections.reduce((acc: any, current: any) => {
    const fieldName = current.name.value;
    acc[fieldName] = current.selectionSet
      ? parseSelection(current.selectionSet)
      : 1;
    return acc;
  }, {});
}

export default parse;
