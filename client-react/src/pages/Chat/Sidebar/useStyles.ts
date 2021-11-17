import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      width: '330px',
      height: '100vh',
      padding: theme.spacing(1),
      // TODO: Think of a way to make this really responsive...
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
