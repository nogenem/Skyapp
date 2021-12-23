import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      alignItems: 'end',
      width: '100%',
      maxHeight: `calc(30vh - ${theme.spacing(1)}px)`,
    },
    inputContainer: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexFlow: 'column',
      justifyContent: 'end',
    },
    previewContainer: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      overflow: 'auto',
      height: '100%',
    },
    previewFileContainer: {
      height: '150px',
      width: '150px',
      borderRadius: theme.spacing(1),
      margin: theme.spacing(1) / 2,
      border: `${theme.palette.primary.main} 2px solid`,
      position: 'relative',
      display: 'inline-flex',
      '&:hover': {
        border: `${theme.palette.secondary.main} 2px solid`,
      },
      '& > img': {
        width: '100%',
        height: '100%',
        borderRadius: theme.spacing(1),
        objectFit: 'cover',
      },
      '& > .file-preview': {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        padding: theme.spacing(1),
        width: '100%',
      },
    },
    previewImageCloseContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
      background: 'rgba(0,0,0,0.75)',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      '&:hover': {
        color: theme.palette.secondary.main,
      },
    },
    sendInput: {
      width: '100%',
      margin: '0',
      marginTop: theme.spacing(1),
    },
    icon: {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    emojiMenuItem: {
      padding: 0,
    },
    previewIconContainer: {
      marginLeft: theme.spacing(1),
    },
    inputIconContainer: {
      marginLeft: theme.spacing(1),
      marginBottom: theme.spacing(1) / 2,
    },
  }),
);

export default useStyles;
