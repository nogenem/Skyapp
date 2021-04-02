import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

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
  }),
);

export default useStyles;
