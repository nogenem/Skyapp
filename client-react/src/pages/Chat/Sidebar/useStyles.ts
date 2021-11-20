import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      minWidth: '330px',
      maxWidth: '330px',
      height: '100vh',
      padding: theme.spacing(1),

      '&.expanded': {
        width: '100%',
        maxWidth: 'unset',
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
