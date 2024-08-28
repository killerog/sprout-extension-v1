import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Amount from './Amount';

let transactionAmount, transactionAmountInflow;

const updateAmount = (amount, inflow) => {
  transactionAmount = amount;
  transactionAmountInflow = inflow;
}

const setup = (currencyFormat, placeholder) => {
  const utils = render(<Amount update={ updateAmount } currencyFormat={ currencyFormat }></Amount>);
  const input = utils.getByPlaceholderText(placeholder);
  return {
    input, 
    ...utils
  }
}

beforeEach(() => {
  transactionAmount = 0;
  transactionAmountInflow = false;
});

test('Initial setup, 2 decimals ($0.00)', () => {
  const currencyFormat = {
    "iso_code": "CAD",
    "example_format": "123,456.78",
    "decimal_digits": 2,
    "decimal_separator": ".",
    "symbol_first": true,
    "group_separator": ",",
    "currency_symbol": "$",
    "display_symbol": true,
  };
  const placeholder = '$0.00';
  setup(currencyFormat, placeholder);

  expect(screen.getByPlaceholderText(placeholder));
  expect(transactionAmount).toBe(0);
  expect(transactionAmountInflow).toBe(false);
});

test('2 decimals ($0.00)', () => {
  const currencyFormat = {
    "iso_code": "CAD",
    "example_format": "123,456.78",
    "decimal_digits": 2,
    "decimal_separator": ".",
    "symbol_first": true,
    "group_separator": ",",
    "currency_symbol": "$",
    "display_symbol": true,
  };
  const placeholder = '$0.00';
  const { input } = setup(currencyFormat, placeholder);

  userEvent.type(input, '15.99');
  fireEvent.blur(input);

  expect(screen.getByPlaceholderText(placeholder));
  expect(input.value).toBe('15.99');
  expect(transactionAmount).toBe(15.99);
  expect(transactionAmountInflow).toBe(false);
});

test('No decimal digits (¥0), inflow', () => {
  const currencyFormat = {
    "iso_code": "JPY",
    "example_format": "123,456",
    "decimal_digits": 0,
    "decimal_separator": ".",
    "symbol_first": true,
    "group_separator": ",",
    "currency_symbol": "¥",
    "display_symbol": true
  };
  const placeholder = '¥0';
  const { input } = setup(currencyFormat, placeholder);

  userEvent.type(input, '10');
  fireEvent.blur(input);
  userEvent.click(screen.getByText('Inflow'));

  expect(screen.getByPlaceholderText(placeholder));
  expect(input.value).toBe('10');
  expect(transactionAmount).toBe(10);
  expect(transactionAmountInflow).toBe(true);
});

test('Symbol after amount (0,00сўм), one decimal entered', () => {
  const currencyFormat = {
    "iso_code": "UZS",
    "example_format": "123 456,78",
    "decimal_digits": 2,
    "decimal_separator": ",",
    "symbol_first": false,
    "group_separator": " ",
    "currency_symbol": "сўм",
    "display_symbol": true
  };
  const placeholder = '0,00сўм';
  const { input } = setup(currencyFormat, placeholder);

  userEvent.type(input, '7.1');
  fireEvent.blur(input);

  expect(screen.getByPlaceholderText(placeholder));
  expect(input.value).toBe('7.10'); // 7,10
  expect(transactionAmount).toBe(7.10);
  expect(transactionAmountInflow).toBe(false);
});

test('No symbol, 123 456-78 format (0-00), inflow', () => {
  const currencyFormat = {
    "iso_code": "USD",
    "example_format": "123 456-78",
    "decimal_digits": 2,
    "decimal_separator": "-",
    "symbol_first": false,
    "group_separator": " ",
    "currency_symbol": "$",
    "display_symbol": false
  };
  const placeholder = '0-00';
  const { input } = setup(currencyFormat, placeholder);

  userEvent.type(input, '123.45');
  fireEvent.blur(input);
  userEvent.click(screen.getByText('Inflow'));

  expect(screen.getByPlaceholderText(placeholder));
  expect(input.value).toBe('123.45'); // 123-45
  expect(transactionAmount).toBe(123.45);
  expect(transactionAmountInflow).toBe(true);
});