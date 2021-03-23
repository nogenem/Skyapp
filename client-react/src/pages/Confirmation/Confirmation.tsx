import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Grid, Avatar, Typography } from '@material-ui/core';
import { LockOutlined as LockOutlinedIcon } from '@material-ui/icons';
import { RouteComponentProps, navigate } from '@reach/router';

import { Alert, Spinner } from '~/components';
import useObjState from '~/hooks/useObjState';
import { confirmation as confirmationAction } from '~/redux/user/actions';
import type { IConfirmationCredentials } from '~/redux/user/types';
import handleServerErrors from '~/utils/handleServerErrors';

import useStyles from './useStyles';

interface IErrors {
  [x: string]: string;
}

interface IOwnState {
  loading: boolean;
  errors: IErrors;
}
type TState = IOwnState;

const initialState: TState = {
  loading: true,
  errors: {},
};

const mapDispatchToProps = {
  confirmation: confirmationAction,
};

const connector = connect(null, mapDispatchToProps);
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface OwnProps extends RouteComponentProps {
  token?: string;
}

type TProps = RouteComponentProps & TPropsFromRedux & OwnProps;

const Confirmation = ({ token, confirmation }: TProps) => {
  const classes = useStyles();
  const [state, setState] = useObjState<TState>(initialState);
  const isMounted = React.useRef(false);

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  React.useEffect(() => {
    async function confirm() {
      try {
        const credentials: IConfirmationCredentials = {
          token: token as string,
        };
        await confirmation(credentials);
        setState(() => {
          if (isMounted.current) return { loading: false, errors: {} };
          return {};
        });
        navigate('/chat');
      } catch (err) {
        setState({ loading: false, errors: handleServerErrors(err) });
      }
    }
    confirm();
  }, [token, confirmation, setState]);

  return (
    <>
      <Grid container className={classes.root}>
        <Grid item xs={12} className={classes.container}>
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Token Confirmation
            </Typography>

            {!state.errors.global && (
              <Alert bgcolor="primary.main" color="primary.contrastText">
                Validating your email...
              </Alert>
            )}
            {state.errors.global && <Alert>{state.errors.global}</Alert>}
          </div>
        </Grid>
      </Grid>
      <Spinner show={state.loading} color="secondary" />
    </>
  );
};

export type { TProps, TState };
export const UnconnectedConfirmation = Confirmation;
export default connector(Confirmation);
