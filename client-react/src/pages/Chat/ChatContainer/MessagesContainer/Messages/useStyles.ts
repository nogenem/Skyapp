import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import getInverseThemeMode from '~/utils/getInverseThemeMode';

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
    image_message_img: {
      maxWidth: 'min(330px, 100%)',
      maxHeight: '250px',
    },
    file_message_icon: {
      width: '1.5em',
      height: '1.5em',
      marginRight: '10px',
    },
    file_message_link: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: 'inherit',
      textDecoration: 'none',
    },
    text_message: {
      whiteSpace: 'pre-line',
      '& a': {
        color: theme.palette.primary[getInverseThemeMode(theme.palette.type)],
      },
    },
    audio_message: {
      maxHeight: '100%',
      maxWidth: '100%',
      margin: 'auto',
      objectFit: 'contain',
    },
  }),
);

export default useStyles;
