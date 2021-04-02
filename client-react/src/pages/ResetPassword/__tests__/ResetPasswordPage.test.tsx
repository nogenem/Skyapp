import React from 'react';

import { getRenderWithRedux } from '~/utils/testUtils';

import { ResetPassword as ResetPasswordPage } from '../index';

const renderWithRedux = getRenderWithRedux();

// TODO: Add better tests for this !?
// The ./Form is already being tested by this
// and the ~/components/Form is being tested there, so...
describe('ResetPasswordPage', () => {
  it('renders correctly', () => {
    const { container } = renderWithRedux(<ResetPasswordPage />);

    expect(container).toMatchSnapshot();
  });
});
