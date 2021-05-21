import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import getInverseThemeMode from '~/utils/getInverseThemeMode';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textInput: {
      '& label.Mui-focused': {
        color: theme.palette.primary[getInverseThemeMode(theme.palette.type)],
      },
      '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
          borderColor:
            theme.palette.primary[getInverseThemeMode(theme.palette.type)],
        },
      },
    },
  }),
);

export default useStyles;
