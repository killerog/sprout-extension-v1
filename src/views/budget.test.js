import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getRequest } from '../api/ynab';
import Budget from './budget';
import { budgets } from '../../test/data';

jest.mock('../api/ynab');

beforeAll(() => {
  global.chrome = require('sinon-chrome');
});

test('Fetch multiple budgets', async () => {
  getRequest.mockResolvedValueOnce(budgets);
  render(<Budget></Budget>);

  await expect(screen.findByText('My budget'));
  await expect(screen.findByText('My other budget'));
})