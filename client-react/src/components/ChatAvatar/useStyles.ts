import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      position: 'relative',
      maxWidth: '40px',
      maxHeight: '40px',
    },
    icon: {
      width: '100%',
      height: '100%',
    },
    dotContainer: {
      position: 'absolute',
      bottom: '0',
      right: '0',
      display: 'flex',
    },
  }),
);

export default useStyles;
