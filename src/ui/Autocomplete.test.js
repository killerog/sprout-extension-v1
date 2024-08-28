import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Autocomplete from './Autocomplete';
import { getSortedAccounts, getSortedCategories, getSortedPayees, budgets } from '../../test/data';

let transactionAccountId, transactionAccountName, transactionAccountIsTracking, transactionPayeeId, transactionPayeeName, transactionPayeeIsTransfer, transactionCategoryId, transactionCategoryName;
let accounts, payees, categories, currencyFormat;

const updateAccount = (id, name, isTracking) => {
  transactionAccountId = id;
  transactionAccountName = name;
  transactionAccountIsTracking = isTracking;
}

const updatePayee = (id, name, isTransfer) => {
  transactionPayeeId = id;
  transactionPayeeName = name;
  transactionPayeeIsTransfer = isTransfer;
}

const updateCategory = (id, name) => {
  transactionCategoryId = id;
  transactionCategoryName = name;
}

const setup = (array, type, update, showBalance = null, currencyFormat = null, disabled = false) => {
  let utils = null;
  utils = render(<Autocomplete array={ array } type={ type } update={ update } showBalance={showBalance} currencyFormat={ currencyFormat } disabled={ disabled }></Autocomplete>);
  const input = utils.getByDisplayValue('');
  return {
    input, 
    ...utils
  }
}

beforeAll(() => {
  payees = getSortedPayees();
  accounts = getSortedAccounts();
  categories = getSortedCategories();
  currencyFormat = budgets[0].currency_format;
});

beforeEach(() => {
  transactionAccountId = null;
  transactionAccountName = null;
  transactionAccountIsTracking = null;
  transactionPayeeId = null;
  transactionPayeeName = null;
  transactionPayeeIsTransfer = null;
  transactionCategoryId = null;
  transactionCategoryName = null;
})

test('Payees test', () => {
  const { input } = setup(payees, 'payee', updatePayee);

  userEvent.type(input, 'John');
  userEvent.click(screen.getByText('John Doe'));

  expect(transactionPayeeId).toBe('f5ed544e-9314-4ab8-944b-1e4074e56953');
  expect(transactionPayeeName).toBe('John Doe');
  expect(transactionPayeeIsTransfer).toBe(false);
});

test('Transfer payee test, no input', () => {
  const { input } = setup(payees, 'payee', updatePayee);

  fireEvent.focus(input);
  userEvent.click(screen.getByText('Transfer : Chequing'));

  expect(transactionPayeeId).toBe('ece36b2e-245f-488f-a65a-8f19e6fb4730');
  expect(transactionPayeeName).toBe('Transfer : Chequing');
  expect(transactionPayeeIsTransfer).toBe(true);
});

test('Accounts test', () => {
  const { input } = setup(accounts, 'account', updateAccount, true, currencyFormat);

  userEvent.type(input, 'Che');
  userEvent.click(screen.getByText('Chequing'));

  expect(transactionAccountId).toBe('32d13aa5-b7f8-4af6-8945-15ff0c7d4572');
  expect(transactionAccountName).toBe('Chequing');
  expect(transactionAccountIsTracking).toBe(false);
});

test('Tracking account test, no input', () => {
  const { input } = setup(accounts, 'account', updateAccount, true, currencyFormat);

  fireEvent.focus(input);
  userEvent.click(screen.getByText('Mortgage'));

  expect(transactionAccountId).toBe('8728041b-8c2a-4932-b92c-bdc033709018');
  expect(transactionAccountName).toBe('Mortgage');
  expect(transactionAccountIsTracking).toBe(true);
});

test('Category test', () => {
  const { input } = setup(categories, 'category', updateCategory, true, currencyFormat);

  userEvent.type(input, 'rent');
  userEvent.click(screen.getByText('Rent/Mortgage'));

  expect(transactionCategoryId).toBe('bc13b98a-4ef8-4e68-8cf9-fb3890379c49');
  expect(transactionCategoryName).toBe('Immediate Obligations: Rent/Mortgage');
});