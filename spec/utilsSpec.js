/*global describe, it, expect, afterEach */

'use strict';

var utils = require('../utils');

describe('utils module', function () {
    describe('calc()', function () {
        var calc = utils.priv.calc;

        it('should do simple addition', function () {
            expect(calc('1', '+', '1')).toEqual(2);
        });

        it('should do simple substraction', function () {
            expect(calc('1', '-', '1')).toEqual(0);
        });

        it('should do simple multiplication', function () {
            expect(calc('2', '*', '3')).toEqual(6);
        });

        it('should do simple division', function () {
            expect(calc('8', '/', '2')).toEqual(4);
        });

        it('should support negative numbers', function () {
            expect(calc('-1', '+', '-1')).toEqual(-2);
            expect(calc('-2', '-', '-1')).toEqual(-1);
            expect(calc('-5', '*', '-3')).toEqual(15);
            expect(calc('-6', '/', '-2')).toEqual(3);
        });

        it('should support floating point numbers', function () {
            expect(calc('1.1', '+', '.3')).toBeCloseTo(1.4);
            expect(calc('2.5', '-', '0.5')).toBeCloseTo(2);
            expect(calc('3.4', '*', '5.9')).toBeCloseTo(20.06);
            expect(calc('12', '/', '1.6')).toBeCloseTo(7.5);
        });

        it('should not allow operands in a non-numeric format', function () {
            expect(calc.bind(null, 'a1', '*', '2')).toThrow();
            expect(calc.bind(null, '4', '+', 'b4')).toThrow();
        });

        it('should not allow division by zero', function () {
            expect(calc.bind(null, '1', '/', '0')).toThrow();
        });
    });

    describe('getResult()', function () {
        // this should do everything calc() does, but return a string instead

        var getResult = utils.priv.getResult;

        it('should do simple addition', function () {
            expect(getResult('1 + 1', '1', '+', '1')).toEqual('2');
        });

        it('should do simple substraction', function () {
            expect(getResult('1 - 1', '1', '-', '1')).toEqual('0');
        });

        it('should do simple multiplication', function () {
            expect(getResult('2 * 3', '2', '*', '3')).toEqual('6');
        });

        it('should do simple division', function () {
            expect(getResult('8 / 2', '8', '/', '2')).toEqual('4');
        });

        it('should support negative numbers', function () {
            expect(getResult('-1 + -1', '-1', '+', '-1')).toEqual('-2');
            expect(getResult('-2 - -1', '-2', '-', '-1')).toEqual('-1');
            expect(getResult('-5 * -3', '-5', '*', '-3')).toEqual('15');
            expect(getResult('-6 / -2', '-6', '/', '-2')).toEqual('3');
        });

        it('should support floating point numbers', function () {
            expect(getResult('1.1 + .3', '1.1', '+', '.3')).toBeCloseTo('1.4');
            expect(getResult('2.5 - 0.5', '2.5', '-', '0.5')).toBeCloseTo('2');
            expect(getResult('3.4 * 5.9', '3.4', '*', '5.9')).toBeCloseTo('20.06');
            expect(getResult('12 / 1.6', '12', '/', '1.6')).toBeCloseTo('7.5');
        });

        it('should preserve preceeding operators in the first operand', function () {
            expect(getResult('+ -3 * 2', '+ -3', '*', '2')).toEqual('+ -6');
        });
    });

    describe('doOperation()', function () {
        var doOperation = utils.priv.doOperation;

        it('should do all multiplication operations', function () {
            expect(doOperation('2 * 2 - 3 * 3 + 4 * 5', '*')).toEqual('4 - 9 + 20');
        });

        it('should do all division operations', function () {
            expect(doOperation('12 / 2 * 1 - 24 / 3 + 3', '/')).toEqual('6 * 1 - 8 + 3');
        });

        it('should do all addition operations', function () {
            expect(doOperation('9 - 4 + 3 + 1 * 7', '+')).toEqual('9 - 8 * 7');
        });

        it('should do all subtraction operations', function () {
            expect(doOperation('3 - 2 + 4 - 3 * 5', '-')).toEqual('1 + 1 * 5');
        });

        it('should do all subtraction operations with negative numbers', function () {
            expect(doOperation('3 - 5 + 4 - 8 * 5', '-')).toEqual('-2 + -4 * 5');
        });
    });

    describe('evaluateSimpleExpression()', function () {
        var evaluateSimpleExpression = utils.priv.evaluateSimpleExpression;

        it('should follow the order of operations', function () {
            expect(evaluateSimpleExpression('4 + 1 * 6 / 3 - 2')).toEqual('4');
            expect(evaluateSimpleExpression('-4 - 3 * 4 + 9 / 3')).toEqual('-13');
            expect(evaluateSimpleExpression('8 - 8 / 4 + 3 * 5')).toEqual('21');
        });
    });

    describe('evaluateParens()', function () {
        var evaluateParens = utils.priv.evaluateParens;

        it('should evaluate an expression inside parentheses', function () {
            expect(evaluateParens('4 * (7 - 5)')).toEqual('4 * 2');
        });

        it('should evaluate expressions inside nested parentheses', function () {
            expect(evaluateParens('4 * (7 - (4 / 2)) * 2')).toEqual('4 * 5 * 2');
        });

        it('should not allow mismatched parenthesis', function () {
            expect(evaluateParens.bind(null, '4 * (7 - 5')).toThrow();
            expect(evaluateParens.bind(null, '4 * 7 - 5)')).toThrow();
            expect(evaluateParens.bind(null, '4 * (7) - 5)')).toThrow();
            expect(evaluateParens.bind(null, '4 * )((7 - 5)')).toThrow();
        });
    });

    describe('setVariable()', function () {
        var setVariable = utils.priv.setVariable;

        afterEach(function () {
            // reset any variables that were created
            utils.priv.variables = {};
        });

        it('should set a variable for an account', function () {
            setVariable('n', 10, 'bill');

            expect(typeof utils.priv.variables.bill).toEqual('object');
            expect(typeof utils.priv.variables.bill).not.toBeNull();
            expect(utils.priv.variables.bill.n).toEqual(10);
        });

        it('should only allow a single letter for a name', function () {
            expect(setVariable.bind(null, 'test', 123, 'bill')).toThrow();
        });

        it('should only allow a number for a value', function () {
            expect(setVariable.bind(null, 'a', 'a', 'bill')).toThrow();
            expect(setVariable.bind(null, 'a', '123', 'bill')).toThrow();
            expect(setVariable.bind(null, 'a', true, 'bill')).toThrow();
        });
    });

    describe('getVariable method', function () {
        afterEach(function () {
            // reset any variables that were created
            utils.priv.variables = {};
        });

        it('should only get variables that have been set', function () {
            expect(utils.getVariable.bind(utils, 'x', 'bill')).toThrow();
        });

        it('should get the variable value for the specified account', function () {
            utils.priv.setVariable('b', 1, 'bill');
            utils.priv.setVariable('b', 2, 'matt');

            expect(utils.getVariable('b', 'bill')).toEqual(1);
            expect(utils.getVariable('b', 'matt')).toEqual(2);
        });
    });

    describe('deleteVariables method', function () {
        afterEach(function () {
            // reset any variables that were created
            utils.priv.variables = {};
        });

        it('should delete all variables for an account', function () {
            utils.priv.setVariable('x', 4, 'bill');
            utils.priv.setVariable('y', 5, 'bill');
            utils.priv.setVariable('z', 6, 'bill');

            utils.deleteVariables('bill');

            expect(utils.priv.variables.bill).not.toBeDefined();
        });
    });

    describe('evaluateExpression method', function () {
        afterEach(function () {
            // reset any variables that were created
            utils.priv.variables = {};
        });

        it('should only allow single-letter variables', function () {
            expect(utils.evaluateExpression.bind(utils, 'abc + 1', 'bill')).toThrow();
        });

        it('should only allow legal simple expression characters', function () {
            utils.priv.setVariable('a', 2, 'bill');
            expect(utils.evaluateExpression.bind(utils, 'a + 9 ~ 3', 'bill')).toThrow();
        });

        it('should only allow a single decimal point between or before numbers', function () {
            expect(utils.evaluateExpression.bind(utils, '1. * 4')).toThrow();
            expect(utils.evaluateExpression.bind(utils, '1.1.1 - 5')).toThrow();
            expect(utils.evaluateExpression.bind(utils, '..1 + 2')).toThrow();
        });

        it('should not allow missing operators between numbers/parentheses', function () {
            expect(utils.evaluateExpression.bind(utils, '1 1')).toThrow();
            expect(utils.evaluateExpression.bind(utils, '(1 + 2) (5 - 4)')).toThrow();
        });

        it('should only allow valid operator placement', function () {
            expect(utils.evaluateExpression.bind(utils, '1 + + 1')).toThrow();
            expect(utils.evaluateExpression.bind(utils, '1 + -1')).not.toThrow();
            expect(utils.evaluateExpression.bind(utils, '3 * (+1 + 5)')).toThrow();
            expect(utils.evaluateExpression.bind(utils, '3 * (-1 + 5)')).not.toThrow();
        });

        it('should substitute defined variables', function () {
            utils.priv.setVariable('a', 2, 'bill');
            expect(utils.evaluateExpression('a + 5', 'bill')).toEqual('7');

            utils.priv.setVariable('i', 7, 'bill');
            expect(utils.evaluateExpression('a * i - 10 / 5', 'bill')).toEqual('12');
        });

        it('should evaluate entire complex expressions', function () {
            expect(utils.evaluateExpression('4 * (2 - 5) / (3 + 3)')).toEqual('-2');
        });

        it('should not allow a single negative number as a valid expression', function () {
            expect(utils.evaluateExpression.bind(utils, '-6')).toThrow();
            expect(utils.evaluateExpression('-6 + 1')).toEqual('-5');
        });

        it('should allow the unary minus operator', function () {
            // only allow one minus operator, so --6 is okay, but ---6 is not
            expect(utils.evaluateExpression('--6')).toEqual('6');
            expect(utils.evaluateExpression.bind(utils, '---6')).toThrow();
            expect(utils.evaluateExpression('-(--6)')).toEqual('-6');
            expect(utils.evaluateExpression('-(-3 - -5)')).toEqual('-2');
        });
    });

    describe('evaluateEquation method', function () {
        afterEach(function () {
            // reset any variables that were created
            utils.priv.variables = {};
        });

        it('should set a variable to a single value', function () {
            utils.evaluateEquation('a = 9', 'bill');
            expect(utils.getVariable('a', 'bill')).toEqual(9);
        });

        it('should set a variable to the result of an expression', function () {
            utils.evaluateEquation('a = 14 - 5 * 6', 'bill');
            expect(utils.getVariable('a', 'bill')).toEqual(-16);
        });

        it('should set a variable to the result of an expression containing variables', function () {
            utils.priv.setVariable('a', 3, 'bill');
            utils.evaluateEquation('b = 5 * a + 1', 'bill');
            expect(utils.getVariable('b', 'bill')).toEqual(16);
        });
    });
});
