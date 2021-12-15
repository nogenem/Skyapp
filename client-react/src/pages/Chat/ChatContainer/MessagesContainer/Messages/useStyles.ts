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
    image_message_wrapper: {
      display: 'flex',
      maxWidth: '330px',
      maxHeight: '250px',
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
      fontSize: '1rem',
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
    date: {
      fontSize: '.8rem',
      minHeight: '1.2rem',
      color: theme.palette.text.primary,
      textAlign: 'center',
      marginTop: theme.spacing(1),
    },
    fancy: {
      // https://stackoverflow.com/a/14731123
      overflow: 'hidden',
      textAlign: 'center',
      '&:before, &:after': {
        backgroundColor: theme.palette.text.hint,
        content: "''",
        display: 'inline-block',
        height: '1px',
        position: 'relative',
        verticalAlign: 'middle',
        width: '50%',
      },
      '&:before': {
        right: '0.5em',
        marginLeft: '-50%',
      },
      '&:after': {
        left: '0.5em',
        marginRight: '-50%',
      },
    },
    new_messages: {
      fontSize: '.8rem',
      padding: '0.2rem 0 1.2rem 0',
      color: theme.palette.primary[getInverseThemeMode(theme.palette.type)],
      textAlign: 'center',
      '&:before, &:after': {
        backgroundColor:
          theme.palette.primary[getInverseThemeMode(theme.palette.type)],
      },
    },
  }),
);

export default useStyles;
