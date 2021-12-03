import React from 'react';

import { render } from '@testing-library/react';

import { AuthContainer } from '../index';

describe('AuthContainer', () => {
  it('renders correctly when passing title and children', () => {
    const { getByText } = render(
      <AuthContainer title="Some title">
        <div>Hello World</div>
      </AuthContainer>,
    );

    expect(getByText(/some title/i)).toBeInTheDocument();
    expect(getByText(/hello world/i)).toBeInTheDocument();
  });
});
