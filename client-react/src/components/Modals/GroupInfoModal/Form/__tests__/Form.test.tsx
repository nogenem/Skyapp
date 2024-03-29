import React from 'react';

import { fireEvent, waitFor, render } from '@testing-library/react';

import type { IOtherUser } from '~/redux/chat/types';
import FACTORIES from '~/utils/factories';

import { Form } from '../index';

describe('GroupInfoModal > Form', () => {
  it('renders the users', async () => {
    const otherUser1: IOtherUser = FACTORIES.models.otherUser();
    const otherUser2: IOtherUser = FACTORIES.models.otherUser();

    const users: IOtherUser[] = [otherUser1, otherUser2];
    const groupName = 'Test Group';
    const selectedUsersObj = {};
    const isAdminObj = {};
    const errors = {};
    const isLoggedUserAdmin = true;
    const setGroupName = jest.fn();
    const toggleUserSelected = jest.fn();
    const toggleUserIsAdmin = jest.fn();

    const { getByText } = render(
      <Form
        groupName={groupName}
        selectedUsersObj={selectedUsersObj}
        isAdminObj={isAdminObj}
        errors={errors}
        isLoggedUserAdmin={isLoggedUserAdmin}
        users={users}
        setGroupName={setGroupName}
        toggleUserSelected={toggleUserSelected}
        toggleUserIsAdmin={toggleUserIsAdmin}
      />,
    );

    expect(getByText(otherUser1.nickname)).toBeInTheDocument();
    expect(getByText(otherUser2.nickname)).toBeInTheDocument();
  });

  it('renders the user correctly when he is already selected and is an admin', async () => {
    const otherUser: IOtherUser = FACTORIES.models.otherUser();

    const users: IOtherUser[] = [otherUser];
    const groupName = 'Test Group';
    const selectedUsersObj = {
      [otherUser._id]: true,
    };
    const isAdminObj = {
      [otherUser._id]: true,
    };
    const errors = {};
    const isLoggedUserAdmin = true;
    const setGroupName = jest.fn();
    const toggleUserSelected = jest.fn();
    const toggleUserIsAdmin = jest.fn();

    const { getByText, baseElement, queryByLabelText } = render(
      <Form
        groupName={groupName}
        selectedUsersObj={selectedUsersObj}
        isAdminObj={isAdminObj}
        errors={errors}
        isLoggedUserAdmin={isLoggedUserAdmin}
        users={users}
        setGroupName={setGroupName}
        toggleUserSelected={toggleUserSelected}
        toggleUserIsAdmin={toggleUserIsAdmin}
      />,
    );

    expect(getByText(otherUser.nickname)).toBeInTheDocument();
    expect(
      (
        baseElement.querySelector(
          `input[type="checkbox"][name="${otherUser._id}"]`,
        ) as HTMLInputElement
      ).checked,
    ).toBe(true);
    expect(queryByLabelText(/turn into admin/i)).not.toBeInTheDocument();
  });

  it('allows to change the group name', async () => {
    const users: IOtherUser[] = [];
    const groupName = 'Test Group';
    const selectedUsersObj = {};
    const isAdminObj = {};
    const errors = {};
    const isLoggedUserAdmin = true;
    const setGroupName = jest.fn();
    const toggleUserSelected = jest.fn();
    const toggleUserIsAdmin = jest.fn();

    const { baseElement } = render(
      <Form
        groupName={groupName}
        selectedUsersObj={selectedUsersObj}
        isAdminObj={isAdminObj}
        errors={errors}
        isLoggedUserAdmin={isLoggedUserAdmin}
        users={users}
        setGroupName={setGroupName}
        toggleUserSelected={toggleUserSelected}
        toggleUserIsAdmin={toggleUserIsAdmin}
      />,
    );

    const newGroupName = 'New Group Name';
    fireEvent.change(
      baseElement.querySelector('input[name="name"]') as Element,
      {
        target: { value: newGroupName },
      },
    );

    await waitFor(() => expect(setGroupName).toHaveBeenCalled());

    expect(setGroupName).toHaveBeenCalledWith(newGroupName);
  });

  it('allows to toggle a selected user', async () => {
    const otherUser: IOtherUser = FACTORIES.models.otherUser();

    const users: IOtherUser[] = [otherUser];
    const groupName = 'Test Group';
    const selectedUsersObj = {};
    const isAdminObj = {};
    const errors = {};
    const isLoggedUserAdmin = true;
    const setGroupName = jest.fn();
    const toggleUserSelected = jest.fn();
    const toggleUserIsAdmin = jest.fn();

    const { getByText } = render(
      <Form
        groupName={groupName}
        selectedUsersObj={selectedUsersObj}
        isAdminObj={isAdminObj}
        errors={errors}
        isLoggedUserAdmin={isLoggedUserAdmin}
        users={users}
        setGroupName={setGroupName}
        toggleUserSelected={toggleUserSelected}
        toggleUserIsAdmin={toggleUserIsAdmin}
      />,
    );

    fireEvent.click(getByText(otherUser.nickname));

    expect(toggleUserSelected).toHaveBeenCalledWith(otherUser._id);
  });

  it('allows to toggle a user as admin', async () => {
    const otherUser: IOtherUser = FACTORIES.models.otherUser();

    const users: IOtherUser[] = [otherUser];
    const groupName = 'Test Group';
    const selectedUsersObj = {};
    const isAdminObj = {};
    const errors = {};
    const isLoggedUserAdmin = true;
    const setGroupName = jest.fn();
    const toggleUserSelected = jest.fn();
    const toggleUserIsAdmin = jest.fn();

    const { getByTestId } = render(
      <Form
        groupName={groupName}
        selectedUsersObj={selectedUsersObj}
        isAdminObj={isAdminObj}
        errors={errors}
        isLoggedUserAdmin={isLoggedUserAdmin}
        users={users}
        setGroupName={setGroupName}
        toggleUserSelected={toggleUserSelected}
        toggleUserIsAdmin={toggleUserIsAdmin}
      />,
    );

    fireEvent.click(getByTestId('user-avatar'));

    expect(toggleUserIsAdmin).toHaveBeenCalledWith(otherUser._id);
  });
});
