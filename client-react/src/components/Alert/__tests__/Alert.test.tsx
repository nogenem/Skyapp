import React from 'react';

import { render } from '@testing-library/react';

import { Alert } from '../index';

describe('Alert', () => {
  it('renders correctly when passing children', () => {
    const { getByText } = render(
      <Alert>
        <div>Hello World</div>
      </Alert>,
    );

    expect(getByText(/hello world/i)).toBeInTheDocument();
  });
});
