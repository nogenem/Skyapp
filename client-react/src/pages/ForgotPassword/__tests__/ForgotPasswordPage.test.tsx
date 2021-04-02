import React from 'react';

import { getRenderWithRedux } from '~/utils/testUtils';

import { ForgotPassword as ForgotPasswordPage } from '../index';

const renderWithRedux = getRenderWithRedux();

// TODO: Add better tests for this !?
// The ./Form is already being tested by this
// and the ~/components/Form is being tested there, so...
describe('ForgotPasswordPage', () => {
  it('renders correctly', () => {
    const { container } = renderWithRedux(<ForgotPasswordPage />);

    expect(container).toMatchSnapshot();
  });
});
