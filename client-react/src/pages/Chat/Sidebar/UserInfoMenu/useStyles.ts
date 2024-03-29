import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      cursor: 'pointer',
      marginBottom: theme.spacing(1),
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      marginLeft: theme.spacing(1),
    },
  }),
);

export default useStyles;
