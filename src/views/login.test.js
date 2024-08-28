/* eslint-disable no-undef */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './login';
import userEvent from '@testing-library/user-event';

beforeAll(() => {
  global.chrome = require('sinon-chrome');
});

beforeEach(() => {
  chrome.runtime.sendMessage.flush();
});

test('Load login', async () => {
  render(<Login></Login>);
  await expect(screen.findByText('Login with YNAB'));
});

test('Click Login with YNAB', async () => {
  render(<Login></Login>);
  userEvent.click(screen.getByText('Login with YNAB'));
  await expect(chrome.runtime.sendMessage.calledOnce);
})