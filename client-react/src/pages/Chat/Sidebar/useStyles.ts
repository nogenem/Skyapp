import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      width: '330px',
      height: '100vh',
      padding: theme.spacing(1),

      '&.expanded': {
        width: '100%',
      },
      '&.hidden': {
        display: 'none',
      },
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
