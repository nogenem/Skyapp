import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      marginLeft: '10px',
      color: theme.palette.primary.contrastText,
      // margin: theme.spacing(2, 0, 1, 0)
    },
    iconRoot: {
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    fileInput: {
      display: 'none',
    },
  }),
);

export default useStyles;
