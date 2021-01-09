import React from 'react';

import Spinner from '../Spinner';

export interface IErrors {
  [x: string]: string;
}

export interface IGetInputByName {
  (name: string): HTMLInputElement;
}

interface OwnState {
  loading: boolean;
  errors: IErrors;
}
export type State = OwnState;

const defaultProps = {
  id: '',
  resetData: (getInputByName: IGetInputByName) => {},
};
interface OwnProps<D> {
  getData: (getInputByName: IGetInputByName) => D;
  submit: (data: D) => Promise<void>;
  render: (state: OwnState) => React.ReactNode;
  validate: (data: D) => IErrors;
}
export type Props<D> = OwnProps<D> & typeof defaultProps;

const initialState: State = {
  loading: false,
  errors: {},
};

const getId = (id: string) =>
  id || `sky-form-${Math.floor(Math.random() * 100000)}`;

function Form<D>({
  id,
  getData,
  resetData,
  validate,
  submit,
  render,
}: Props<D>) {
  const [formId, setFormId] = React.useState(getId(id));
  const [state, setState] = React.useState<State>(initialState);
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
    document.querySelector(
      `#${formId} input[name="${name}"]`,
    ) as HTMLInputElement;

  const focusOnFirstInput = () => {
    const el = document.querySelector(`#${formId} input[name]`) as HTMLElement;
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
            errors: err,
          });
        }
      }
    } else setState({ loading: false, errors });

    if (isMounted.current) focusOnFirstInput();
  };

  return (
    <>
      <form id={formId} onSubmit={onSubmit} style={{ width: '100%' }}>
        {render(state)}
      </form>
      <Spinner show={state.loading} size="4rem" />
    </>
  );
}

Form.defaultProps = defaultProps;

export default Form;
