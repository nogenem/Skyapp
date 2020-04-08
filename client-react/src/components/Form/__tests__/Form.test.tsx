import React from "react";

import {
  render,
  fireEvent,
  waitForElementToBeRemoved
} from "@testing-library/react";

import Form, { OwnState, OwnProps } from "../index";

const FormContent = ({ errors }: OwnState) => (
  <>
    <input data-testid="nickname" name="nickname" type="text" />
    {errors.nickname ? <span role="alert">{errors.nickname}</span> : null}
    <button type="submit">Submit</button>
  </>
);

describe("Form", () => {
  it("renders and works correctly", async () => {
    const props: OwnProps = {
      id: "form",
      validate: jest.fn(() => ({})),
      render: jest.fn(FormContent),
      getData: jest.fn(getInputByName => ({
        nickname: getInputByName("nickname").value.trim()
      })),
      resetData: jest.fn(getInputByName => {
        getInputByName("nickname").value = "";
      }),
      submit: jest.fn(async () => {})
    };

    const { container, getByTestId, getByText, queryByTestId } = render(
      <Form {...props} />
    );

    expect(props.render).toHaveBeenCalledTimes(1);

    fireEvent.change(getByTestId(/nickname/i), { target: { value: "chuck" } });

    fireEvent.click(getByText(/submit/i));

    await waitForElementToBeRemoved(() => queryByTestId(/spinner_div/i), {
      container
    }); // wait for the Spinner to disappear

    expect(props.getData).toHaveBeenCalledTimes(1);
    expect(props.resetData).toHaveBeenCalledTimes(1);
    expect(props.validate).toHaveBeenCalledTimes(1);
    expect(props.validate).toHaveBeenCalledWith({ nickname: "chuck" });
    expect(props.submit).toHaveBeenCalledTimes(1);
    expect(props.submit).toHaveBeenCalledWith({ nickname: "chuck" });
  });

  it("passes the `validate`'s errors correctly", async () => {
    const props: OwnProps = {
      id: "form",
      validate: jest.fn(() => ({ nickname: "Cant be blank" })),
      render: jest.fn(FormContent),
      getData: jest.fn(getInputByName => ({
        nickname: getInputByName("nickname").value.trim()
      })),
      resetData: jest.fn(getInputByName => {
        getInputByName("nickname").value = "";
      }),
      submit: jest.fn(async () => {})
    };

    const { getByText, findByRole } = render(<Form {...props} />);

    fireEvent.click(getByText(/submit/i));

    const alert = await findByRole("alert");

    expect(alert).toHaveTextContent(/cant be blank/i);
  });
});
