import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    system_message_wrapper: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    system_messages: {
      fontSize: '.8rem',
      margin: '0.2rem 0 0.6rem 0',
      padding: '0.2rem 0 0.1rem 0',
      color: theme.palette.text.primary,
      textAlign: 'center',
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        maxWidth: '50%',
      },
    },
  }),
);

export default useStyles;
