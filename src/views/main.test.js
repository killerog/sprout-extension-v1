import React from 'react';
import { render, screen, getByTestId, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getRequest } from '../api/ynab';
import Main from './main';
import userEvent from '@testing-library/user-event';
import { settings, categories, accounts, payees } from '../../test/data';

jest.mock('../api/ynab');

beforeAll(() => {
  global.chrome = require('sinon-chrome');
});

beforeEach(() => {
  getRequest.mockResolvedValueOnce(settings);
  getRequest.mockResolvedValueOnce(categories);
  getRequest.mockResolvedValueOnce(accounts);
  getRequest.mockResolvedValueOnce(payees);
});

test('Initial open', () => {
  render(<Main></Main>);
  expect(screen.findByText('My budget'));
});

test('Clear select', () => {
  render(<Main></Main>);
  userEvent.click(screen.getByTitle('Clear'));
  expect(screen.getByAltText('Transaction cleared'));

  userEvent.click(screen.getByTitle('Clear'));
  expect(screen.getByAltText('Transaction not cleared'));
});

test('Date input', () => {
  const { container } = render(<Main></Main>);
  const input = getByTestId(container, 'transaction-date');
  const date = '2021-03-24'

  fireEvent.change(input, {target: {value: date}})
  expect(input.value).toBe(date);
});

test('Memo input', () => {
  const { container } = render(<Main></Main>);
  const input = getByTestId(container, 'memo');
  const memo = 'Gifts for the family';

  userEvent.type(input, memo)
  expect(input.value).toBe(memo);
});

