import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
    },
  }),
);

export default useStyles;
