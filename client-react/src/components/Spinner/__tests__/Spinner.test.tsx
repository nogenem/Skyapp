import React from "react";

import { render } from "@testing-library/react";

import Spinner from "../index";

describe("Spinner", () => {
  it("renders correctly when `show` is true", () => {
    const { getByTestId } = render(<Spinner show />);

    expect(getByTestId(/spinner_div/i)).toBeInTheDocument();
  });

  it("renders correctly when `show` is false", () => {
    const { queryByTestId } = render(<Spinner />);

    expect(queryByTestId(/spinner_div/i)).toBeNull();
  });
});
