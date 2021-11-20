import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      height: '100vh',
    },
    rightContainer: {
      display: 'flex',
      width: '100%',
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      height: '100vh',

      '&.hidden': {
        display: 'none',
      },
    },
  }),
);

export default useStyles;
