import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import getInverseThemeMode from '~/utils/getInverseThemeMode';

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
      color: theme.palette.primary[getInverseThemeMode(theme.palette.type)],
    },
    checkIcon: {
      '&:not(:disabled)': {
        color: theme.palette.secondary[getInverseThemeMode(theme.palette.type)],
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
  }),
);

export default useStyles;
