import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: theme.spacing(1) / 2,
      width: '100%',
      borderBottom: `1px ${theme.palette.grey['600']} solid`,
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      marginLeft: theme.spacing(1),
      maxWidth: '300px',
    },
    backIconRoot: {
      marginRight: theme.spacing(1),
    },
  }),
);

export default useStyles;
