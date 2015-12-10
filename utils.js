/**
 * @module utils
 * @author Bill Bryant
 */

'use strict';

/**
 * The variables assigned by the user and their values.
 * Ex: { 'user1': { 'x': 1 }, 'user2': { 'a': 5 } }
 * @private
 */
var variables = {};

/**
 * Calculates the numeric result of an expression.
 *
 * @param  {String} operand1  The first operand in the expression
 * @param  {String} operator  The operator to use (*, /, +, -)
 * @param  {String} operand2  The second operator in the expression
 * @return {Number}           The numeric result of the calculation
 *
 * @throws {Error}  Operand is not in number format
 * @throws {Error}  Cannot divide by zero
 * @private
 */
function calc(operand1, operator, operand2) {
    var op1 = parseFloat(operand1, 10),
        op2 = parseFloat(operand2, 10),
        result;

    if (isNaN(op1)) {
        throw new Error(operand1 + ' is not a number');
    }

    if (isNaN(op2)) {
        throw new Error(operand2 + ' is not a number');
    }

    switch (operator) {
    case '+':
        result = op1 + op2;
        break;
    case '-':
        result = op1 - op2;
        break;
    case '*':
        result = op1 * op2;
        break;
    case '/':
        if (op2 === 0) {
            throw new Error('Cannot divide by zero');
        }
        result = op1 / op2;
    }

    return result;
}

/**
 * Gets the result of a single expression to be substituted back into the main
 * expression string. This is a helper function to for string.replace().
 *
 * @param  {String} singleExpression  The expression to be evaluated
 * @param  {String} operand1          The first operand in the expression
 * @param  {String} operator          The operator to use (*, /, +, -)
 * @param  {String} operand2          The second operator in the expression
 * @return {String}                   The result to be substituted back into
 *                                    the main expression string
 *
 * @throws {Error}  Operand is not in number format
 * @throws {Error}  Cannot divide by zero
 * @private
 */
function getResult(singleExpression, op1, operator, op2) {
    // operands may include extra preceeding operators if they are negative
    // resubstitute any extra operators back into expression string
    // first capture group must be non-greedy or it will take the following
    // minus sign even when there's only one
    var opNumRegex = /([*\/+\-] *)??(-?(?:\d+(?:\.\d+)?)|(?:\.\d+))/,
        matches = op1.match(opNumRegex);

    // get the first operand excluding any preceeding operators
    op1 = matches[2];

    // prepend any preceeding operators to the result so they are not lost
    // calc() may throw Error, calling function should handle them
    return (matches[1] || '') + calc(op1, operator, op2);
}

/**
 * Evaluate all single expressions in the complex expression string that use
 * the specified operator. Call this function once for each operator.
 *
 * @param  {String} expressionStr  The complex expression for which the
 *                                 operation will be executed
 * @param  {String} operator       The operator for which all contained
 *                                 expressions will be evaluated. This can be a
 *                                 single operator such as '+' or multiple
 *                                 operators such as '+-'.
 * @return {String}                The complex expression with all sub-
 *                                 expressions using the specified operator
 *                                 replaced with their resulting values
 *
 * @throws {Error}  Operand is not in number format
 * @throws {Error}  Cannot divide by zero
 * @private
 */
function doOperation(expressionStr, operator) {
    // write the regexp to allow both 0.1 and .1
    // minus sign is only part of number when there is no space between it
    // and the number and there is another operator, an opening parenthesis,
    // or nothing in front of it (no parens in simple expression)
    // no lookbehind in JavaScript, so grab preceeding operators if number
    // is negative and filter them out later - this is only relevant to the
    // first operand
    var strNumberPattern1 = '((?:(?:^|[*\\/+\\-] *)-)?(?:\\d+(?:\\.\\d+)?)|(?:\\.\\d+))',
        strNumberPattern2 = '(-?(?:\\d+(?:\\.\\d+)?)|(?:\\.\\d+))',
        operatorPattern = '[' + operator.split('').map(function (op) {
            // always escape operator for safety, since *, /, and + have
            // special meanings
            return '\\' + op;
        }).join('') + ']',

        // this is used to check for a negative number in expressionStr
        negNumRegex = /((?:^|[*\/+\-] *)-(?:(?:\d+(?:\.\d+)?)|(?:\.\d+)))/g,
        doubleNegRegex = /^(- *-)((?:\d+(?:\.\d+)?)|(?:\.\d+))$/,
        opMatches,
        negNumMatches,
        result;

    expressionStr = expressionStr.replace(
        new RegExp(strNumberPattern1 + ' *(' +
            operatorPattern + ') *' + strNumberPattern2),

        // this function calls calc() which may throw an Error
        // don't catch errors here, they should be handled further up the call
        // stack
        getResult
    );

    // get the number of remaining occurrences of the operator
    opMatches = expressionStr.match(new RegExp(operatorPattern, 'g'));

    // if there are operators left and this is the '-' operator
    if (opMatches && operatorPattern.indexOf('-') !== -1) {
        // if all that's left is a double negative, evaluate it
        // the minus sign is interpreted as the unary minus operator
        if (doubleNegRegex.test(expressionStr)) {
            // negating a negative makes a positive, so remove the minus signs
            expressionStr = expressionStr.replace(
                /^(- *-)((?:\d+(?:\.\d+)?)|(?:\.\d+))$/,
                '$2'
            );
        }

        // get all negative numbers in expressionStr
        negNumMatches = expressionStr.match(negNumRegex);
    }

    // if there are no operations left to perform
    // or if all remaining operator occurrences are part of negative numbers
    if (!opMatches || (negNumMatches &&
        negNumMatches.length === opMatches.length)) {

        // then all operations have been performed
        result = expressionStr;
    } else {
        // keep performing the operation until there are none left
        result = doOperation(expressionStr, operator);
    }

    return result;
}

/**
 * Evaluates an expression that does not contain parentheses.
 *
 * @param  {String} expression  The expression to evaluate (cannot contain
 *                              parentheses)
 * @return {String}             The resulting value of the expression
 *
 * @throws {Error}  Operand is not in number format
 * @throws {Error}  Cannot divide by zero
 * @private
 */
function evaluateSimpleExpression(expression) {
    var operators = ['*/', '+-'], // in order
        i;

    // perform each operation of the expression according to the order of
    // operations (the operators array is in order)
    for (i = 0; i < operators.length; i += 1) {
        expression = doOperation(expression, operators[i]);
    }

    // expression should be simplified to a single value
    return expression;
}

/**
 * Evaluates all expressions inside sets of parentheses and substitutes the
 * results back into the expression string.
 *
 * @param  {String} expression  The expression string for which the parentheses
 *                              sets will be evaluated
 * @return {String}             The expression string with all parentheses sets
 *                              replaced with their resulting values
 *
 * @throws {SyntaxError}  Mismatched parentheses
 * @throws {Error}        Operand is not in number format
 * @throws {Error}        Cannot divide by zero
 *
 * @private
 */
function evaluateParens(expression) {
    // get the last set of parentheses - find last open parenthesis first
    var startPos = expression.lastIndexOf('('),
        endPos,
        startStr,
        currExpression,
        endStr,
        expressionVal;

    // no opening paren found
    if (startPos === -1) {
        // if also no closing paren, we're done
        if (expression.indexOf(')') === -1) {
            return expression;
        } else {
            // closing paren with no opening paren
            throw new SyntaxError('Mismatched parentheses');
        }
    } else {
        // opening paren found, find matching closing paren
        endPos = expression.indexOf(')', startPos);

        // opening paren with no closing paren
        if (endPos === -1) {
            throw new SyntaxError('Mismatched parentheses');
        }
    }

    // extract the current set of parentheses to process
    startStr = expression.slice(0, startPos);
    currExpression = expression.slice(startPos + 1, endPos);
    endStr = expression.slice(endPos + 1);

    // evaluate the expression in this paren set
    // evaluateSimpleExpression relies on calc() which may throw an Error
    // let them be handled further up the call stack
    // command.execute will take any error messages and output them to the
    // console and the chat, but will continue to function
    expressionVal = evaluateSimpleExpression(currExpression);

    // substitute the result where the this paren set was and keep processing
    // paren sets until none are left
    return evaluateParens(startStr + expressionVal + endStr);
}

/**
 * Sets a variable for the specified account.
 *
 * @param  {String} varName   The name of the variable to be set
 *                            (must be a single letter)
 * @param  {Number} value     The value of the variable to be set
 *                            (must be a number)
 * @param  {String} account   The account that sent the command
 *
 * @throws {SyntaxError} Invalid variable name
 * @throws {TypeError}   Value is not a number
 * @private
 */
function setVariable(varName, value, account) {
    // variable names may only consist of a single letter of the English
    // Alphabet and are case SENSITIVE, so 'A' and 'a' are different
    if (!/^[a-zA-Z]$/.test(varName)) {
        throw new SyntaxError('Invalid variable name');
    } else if (isNaN(value) || typeof value !== 'number') {
        throw new TypeError('Value is not a number');
    } else {
        if (!variables[account]) {
            variables[account] = {};
        }
        variables[account][varName] = value;
    }
}


// Exported (public) functions / static methods

/**
 * Gets the numeric value of the specified variable for the specified account.
 *
 * @param  {String} varName   The name of the variable for which to retrieve
 *                            the value
 * @param  {String} account   The account that sent the command
 * @return {Number}           The value of the specified variable
 *
 * @throws {Error} Variable is not defined
 */
exports.getVariable = function (varName, account) {
    var value;

    // check property name with Object.hasOwnProperty just to be extra safe,
    // even though it's not really necessary in this case, since variable names
    // are restricted to a single letter
    if (Object.prototype.hasOwnProperty.call(variables, account) &&
        Object.prototype.hasOwnProperty.call(variables[account], varName)) {

        value = variables[account][varName];
    } else {
        throw new Error('Variable is not defined');
    }

    return value;
};

/**
 * Deletes all the stored variables for the specified account.
 *
 * @param  {String}  account   The account for which the variables will be
 *                             deleted
 * @return {Boolean}           Whether the variables were successfully deleted
 */
exports.deleteVariables = function (account) {
    console.log('Deleting variables for account: ' + account);
    return delete variables[account];
};

/**
 * Calculates the result of a complex expression.
 *
 * @param  {String} expression  The complex expression to evaluate
 * @param  {String} [account]   The account that sent the command. This is
 *                              required if using variables.
 * @return {String}             The resulting value of the expression
 *
 * @throws {SyntaxError}  Invalid variable name
 * @throws {Error}        Variable is not defined
 * @throws {SyntaxError}  Invalid character
 * @throws {SyntaxError}  Invalid number format
 * @throws {SyntaxError}  Missing operator
 * @throws {SyntaxError}  Invalid operator placement
 * @throws {SyntaxError}  Mismatched parentheses
 * @throws {Error}        Operand is not in number format
 * @throws {Error}        Cannot divide by zero
 */
exports.evaluateExpression = function (expression, account) {
    var output = '',
        simpleExpression;

    // a negative number alone is not a valid expression,
    // but negating a variable should be allowed (unary minus operator),
    // so perform this check before variable substitution
    if (/^-(?:(?:\d+(?:\.\d+)?)|(?:\.\d+))$/.test(expression)) {
        throw new SyntaxError('Missing operator');
    }

    // variables can only be a single letter
    // no other letters or numbers can be immediately next to it
    if (/[a-zA-Z\d.]+[a-zA-Z]|[a-zA-Z][a-zA-Z\d.]+/.test(expression)) {
        throw new SyntaxError('Invalid variable name');
    }

    // variable substitution
    Object.keys(variables[account] || {}).forEach(function (varName) {
        expression = expression.replace(new RegExp(varName, 'g'),
            exports.getVariable(varName, account));
    });

    // only allow the following characters in an expression:
    // ()1234567890.+-*/ and space
    // exponents are not supported (no ^ symbol)
    if (!/^[()\d.+\-*\/ ]+$/.test(expression)) {
        throw new SyntaxError('Invalid character');
    }

    // numbers must be in one of the following formats:
    // 1, 1.0, 0.1, .1
    // 1. is not allowed (trailing decimal place with no number following)
    // regex explanation: a dot followed by any other allowed character other
    // than a digit or by the end of line, OR a dot followed by one or more
    // digits and another dot
    if (/\.(?:[().+\-*\/ ]|$)|\.\d+\./.test(expression)) {
        throw new SyntaxError('Invalid number format');
    }

    // check for missing operators between numbers and parentheses
    if (/(?:(?:\)|\d)[. ]*\()|(?:\)[. ]*\d)|(?:\d +(?:\.|\d))/.test(expression)) {
        throw new SyntaxError('Missing operator');
    }

    // operators are not allowed next to each other except when minus sign
    // comes before a number (ex: 5 - -1)
    if (/(?:[*\/+\-] *[*\/+])|(?:[*\/+\-] *-(?!\.?\d))/.test(expression)) {
        throw new SyntaxError('Invalid operator placement');
    }

    // an operator cannot be the first character (except for negative number)
    // or last character in an expression
    if (/(?:(?:^|\()[*\/+])|(?:[*\/+\-](?:\)|$))/.test(expression)) {
        throw new SyntaxError('Invalid operator placement');
    }

    // evaluate expressions inside parentheses first
    // may throw Error, handle in calling function
    simpleExpression = evaluateParens(expression);

    // then evaluate the resulting expression following the order of operations
    // may throw Error, handle in calling function
    output = evaluateSimpleExpression(simpleExpression);

    // always return a string value
    return output || '';
};

/**
 * Evaluates an equation, assigning the result on the right to the variable on
 * the left.
 *
 * @param  {String} equation   The equation to evaluate, assigning the result
 *                             on the right to the variable on the left
 * @param  {String} [account]  The account that sent the command. This is
 *                             required if using variables.
 * @return {String}            A simplified equation showing the value that was
 *                             assigned to the variable
 *
 * @throws {TypeError}    Value is not a number
 * @throws {SyntaxError}  Invalid variable name
 * @throws {SyntaxError}  Invalid character
 * @throws {SyntaxError}  Invalid number format
 * @throws {SyntaxError}  Missing operator
 * @throws {SyntaxError}  Invalid operator placement
 * @throws {SyntaxError}  Mismatched parentheses
 * @throws {Error}        Operand is not in number format
 * @throws {Error}        Cannot divide by zero
 */
exports.evaluateEquation = function (equation, account) {
    var parts = equation.split('='),
        varName = parts[0].trim(),
        value = parts[1].trim();

    // value is an expression if it contains an operator
    // however, minus sign may also indicate a negative number
    if (/[+\-*\/]/.test(value) &&
        !/^-(?:(?:\d+(?:\.\d+)*)|(?:\.\d+))$/.test(value)) {

        // may throw Error, handle in calling function
        value = exports.evaluateExpression(value, account);
    }

    value = parseFloat(value);

    // may throw Error, handle in calling function
    setVariable(varName, value, account);

    return varName + ' = ' + value;
};


// expose non-exported variables and functions for testing when in a test
// environment: NODE_ENV=test
// this allows testing of smaller units of code
if (process.env.NODE_ENV === 'test') {
    // "priv" is short for "private" which is a reserved word
    exports.priv = {
        variables: variables,
        calc: calc,
        getResult: getResult,
        doOperation: doOperation,
        evaluateSimpleExpression: evaluateSimpleExpression,
        evaluateParens: evaluateParens,
        setVariable: setVariable
    };
}
