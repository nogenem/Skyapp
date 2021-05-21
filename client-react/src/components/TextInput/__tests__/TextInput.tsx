import React from 'react';

import { render } from '@testing-library/react';

import { TextInput } from '../index';

describe('TextInput', () => {
  it('renders correctly', () => {
    const inputLabel = 'Test Input';
    const { getByLabelText } = render(
      <TextInput id="test-input" label={inputLabel} />,
    );

    expect(getByLabelText(inputLabel)).toBeInTheDocument();
  });
});
