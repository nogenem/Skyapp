import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      flexGrow: 1,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: '2em',
      paddingRight: '2em', // 0.5
      overflowY: 'auto',
      maxHeight: `calc(90vh - ${theme.spacing(1)}px)`,
      minHeight: `calc(70vh - ${theme.spacing(1)}px)`,
      marginBottom: theme.spacing(1),
      position: 'relative',
    },
    messageFromMe: {
      padding: '10px',
      margin: '1px 0',
      maxWidth: '70%',
      borderRadius: '10px 0px 0px 10px',
      position: 'relative',
      '& $user_icon': {
        right: '-1.25em',
      },
    },
    messageFromThem: {
      padding: '10px',
      margin: '1px 0',
      maxWidth: '70%',
      borderRadius: '0px 10px 10px 0px',
      position: 'relative',
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '& $user_icon': {
        left: '-1.25em',
      },
    },
    myInfo: {
      alignSelf: 'flex-end',
      fontSize: '.8rem',
      color: theme.palette.text.primary,
      marginTop: theme.spacing(1),
    },
    theirInfo: {
      alignSelf: 'flex-start',
      fontSize: '.8rem',
      color: theme.palette.text.primary,
      marginTop: theme.spacing(1),
    },
    user_icon: {
      position: 'absolute',
      top: '-1em',
      width: '1.2em',
      height: '1.2em',
    },
    last_seen_icon: {
      alignSelf: 'flex-end',
      width: '0.9em',
      height: '0.9em',
      margin: '2px 0',
    },
    messageWrapper: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
    },
    messageWrapperFromMe: {
      flexDirection: 'row-reverse',
    },
    messageWrapperFromThem: {
      flexDirection: 'row',
    },
    loading_icon: {
      width: '1.2em !important',
      height: '1.2em !important',
      margin: `0px ${theme.spacing(1) / 2}px`,
    },
    edited_icon: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: `0px ${theme.spacing(1) / 2}px`,
    },
  }),
);

export default useStyles;
