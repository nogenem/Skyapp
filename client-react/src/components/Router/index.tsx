import React from "react";
import { connect, ConnectedProps } from "react-redux";

import { Router as ReachRouter } from "@reach/router";

import { AppState } from "~/redux/store";
import { getToken } from "~/redux/user/reducer";

const mapStateToProps = (state: AppState) => ({
  isAuthenticated: !!getToken(state)
});
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const defaultProps = {
  // ownProps
  isPrivate: false
};

type OwnProps = {
  children: React.ReactNode;
};
type MyProps = OwnProps & typeof defaultProps & PropsFromRedux;

const Router = ({ isPrivate, isAuthenticated, children }: MyProps) => {
  if ((isPrivate && !isAuthenticated) || (!isPrivate && isAuthenticated))
    return <div />;
  return (
    // https://github.com/reach/router/issues/63
    <ReachRouter primary={false} component={React.Fragment}>
      {children}
    </ReachRouter>
  );
};

Router.defaultProps = defaultProps;

export const UnconnectedRouter = Router;
export default connector(Router);
