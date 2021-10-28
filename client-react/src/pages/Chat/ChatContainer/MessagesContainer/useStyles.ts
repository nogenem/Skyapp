import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      flexGrow: 1,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: '2em',
      paddingRight: '0.5em',
      overflowY: 'auto',
    },
  }),
);

export default useStyles;
