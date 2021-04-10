import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { TThemeMode } from '~/redux/theme/types';

// PS: This should be done automatically by the lib... ;/
const inverseMode = (mode: TThemeMode) => (mode === 'dark' ? 'light' : 'dark');

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    checkIcon: {
      '&:not(:disabled)': {
        color: theme.palette.secondary[inverseMode(theme.palette.type)],
      },
      '& svg': {
        transition: 'font-size 0.3s',
        willChange: 'font-size',
      },
      '&:not(:disabled) svg': {
        fontSize: '1.7rem',
      },
    },
    chevronRightContainer: {
      justifyContent: 'flex-end',
    },
    changeThoughtsInput: {
      '& label.Mui-focused': {
        color: theme.palette.primary[inverseMode(theme.palette.type)],
      },
      '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.primary[inverseMode(theme.palette.type)],
        },
      },
    },
  }),
);

export default useStyles;
