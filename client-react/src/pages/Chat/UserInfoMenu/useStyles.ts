import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { TThemeMode } from '~/redux/theme/types';

// PS: This should be done automatically by the lib... ;/
const inverseMode = (mode: TThemeMode) => (mode === 'dark' ? 'light' : 'dark');

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      cursor: 'pointer',
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column',
      marginLeft: theme.spacing(1),
    },
    menu: {
      minWidth: '300px',
      border: `1px solid ${theme.palette.grey['700']}`,
    },
    nonInteractiveMenuItem: {
      cursor: 'default',
      '&:hover': {
        backgroundColor: 'inherit',
      },
      '&:focus': {
        backgroundColor: 'inherit',
      },
    },
    menuHeaderContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    logo: {
      color: theme.palette.primary[inverseMode(theme.palette.type)],
    },
  }),
);

export default useStyles;
