import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      maxHeight: '10vh',
      height: '100%',
    },
    sendInput: {
      width: '100%',
      margin: '0',
    },
    icon: {
      marginLeft: '10px',
      color: theme.palette.primary.contrastText,
      // margin: theme.spacing(2, 0, 1, 0)
    },
    iconRoot: {
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  }),
);

export default useStyles;
