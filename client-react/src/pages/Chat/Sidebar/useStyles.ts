import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      minWidth: '300px',
      height: '100vh',
      padding: theme.spacing(1),
      // [theme.breakpoints.down(850)]: {
      //   width: '100%',
      // },
    },
    btnsContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: theme.spacing(1),
    },
  }),
);

export default useStyles;
