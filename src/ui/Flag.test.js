import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Flag from './Flag';

let transactionFlag;

const updateFlag = (flag) => {
  transactionFlag = flag;
}

beforeEach(() => {
  transactionFlag = null;
});

test('Initial setup', () => {
  const { container } = render(<Flag update={ updateFlag }></Flag>);

  expect(container.querySelector('.selected')).toBeNull();
});

test('Set one flag', () => {
  const { container } = render(<Flag update={ updateFlag }></Flag>);

  userEvent.click(screen.getByTitle('Red'));

  expect(container.querySelector('.selected')).not.toBeNull();
  expect(transactionFlag).toBe('red');
});

test('Switch flags', () => {
  const { container } = render(<Flag update={ updateFlag }></Flag>);

  userEvent.click(screen.getByTitle('Orange'));
  userEvent.click(screen.getByTitle('Blue'));

  expect(container.querySelector('.selected')).not.toBeNull();
  expect(transactionFlag).toBe('blue');
});
