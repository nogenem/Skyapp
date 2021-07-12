import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import getInverseThemeMode from '~/utils/getInverseThemeMode';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginTop: theme.spacing(2),
    },
    formControl: {
      width: '100%',
    },
    formGroup: {
      maxHeight: '400px',
      overflow: 'auto',
      flexWrap: 'nowrap',
    },
    formLegend: {
      paddingTop: '10px',
      '&.Mui-focused': {
        color: theme.palette.primary[getInverseThemeMode(theme.palette.type)],
      },
    },
    formHelperText: {
      fontSize: '0.85rem',
    },
    checkboxWrapper: {
      justifyContent: 'space-between',
      margin: 0,
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
    userIcon: {
      width: '1.2em',
      height: '1.2em',
    },
    tooltip: {
      // backgroundColor: theme.palette.common.black,
      fontSize: '14px',
    },
  }),
);

export default useStyles;
