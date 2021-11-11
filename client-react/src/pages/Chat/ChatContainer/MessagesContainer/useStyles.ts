import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      flexGrow: 1,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: '2em',
      paddingRight: '0.5em',
      overflowY: 'auto',
      maxHeight: `calc(90vh - ${theme.spacing(1)}px)`,
      minHeight: `calc(70vh - ${theme.spacing(1)}px)`,
      marginBottom: theme.spacing(1),
    },
    messageFromMe: {
      alignSelf: 'flex-end',
      padding: '10px',
      margin: '1px 0',
      maxWidth: '70%',
      borderRadius: '10px 0px 0px 10px',
      position: 'relative',
    },
    messageFromThem: {
      alignSelf: 'flex-start',
      padding: '10px',
      margin: '1px 0',
      maxWidth: '70%',
      borderRadius: '0px 10px 10px 0px',
      position: 'relative',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  }),
);

export default useStyles;
