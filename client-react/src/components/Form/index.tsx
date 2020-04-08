import React from "react";

import PropTypes from "prop-types";

import Spinner from "../Spinner";

interface IErrors {
  [x: string]: string;
}

interface IData {
  [x: string]: any;
}

export interface OwnState {
  loading: boolean;
  errors: IErrors;
}

interface IGetInputByName {
  (name: string): HTMLInputElement;
}

export interface OwnProps {
  id: string;
  getData: (getInputByName: IGetInputByName) => IData;
  resetData: (getInputByName: IGetInputByName) => void;
  validate: (data: IData) => IErrors;
  submit: (data: IData) => Promise<void>;
  render: (state: OwnState) => React.ReactNode;
}

const initialState = {
  loading: false,
  errors: {}
};

const getId = (id: string) =>
  id || `sky-form-${Math.floor(Math.random() * 100000)}`;

const Form = ({
  id,
  getData,
  resetData,
  validate,
  submit,
  render
}: OwnProps) => {
  const [formId, setFormId] = React.useState(getId(id));
  const [state, setState] = React.useState<OwnState>(initialState);
  const isMounted = React.useRef(false);

  React.useEffect(() => {
    isMounted.current = true;
    setTimeout(focusOnFirstInput, 0);
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // quero que seja apenas 'componentDidMount'

  React.useEffect(() => {
    setFormId(getId(id));
  }, [id]);

  const getInputByName: IGetInputByName = name =>
    document.querySelector(`#${id} input[name="${name}"]`) as HTMLInputElement;

  const focusOnFirstInput = () => {
    const el = document.querySelector(`#${id} input[name]`) as HTMLElement;
    if (el) el.focus();
  };

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const data = getData(getInputByName);
    const errors = validate(data);

    if (Object.keys(errors).length === 0) {
      setState({ loading: true, errors: {} });
      try {
        await submit(data);
        if (isMounted.current) {
          resetData(getInputByName);
          setState({ loading: false, errors: {} });
        }
      } catch (err) {
        if (isMounted.current) {
          setState({
            loading: false,
            errors: err
          });
        }
      }
    } else setState({ loading: false, errors });

    if (isMounted.current) focusOnFirstInput();
  };

  return (
    <>
      <form id={formId} onSubmit={onSubmit} style={{ width: "100%" }}>
        {render(state)}
      </form>
      <Spinner show={state.loading} size="4rem" />
    </>
  );
};

Form.propTypes = {
  // ownProps
  id: PropTypes.string,
  validate: PropTypes.func,
  render: PropTypes.func.isRequired,
  getData: PropTypes.func.isRequired,
  resetData: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired
};

Form.defaultProps = {
  // ownProps
  id: "",
  validate: () => ({}),
  resetData: () => {}
};

export default Form;
