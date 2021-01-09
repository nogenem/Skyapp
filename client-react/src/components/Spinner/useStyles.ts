import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'fixed',
      top: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.2)',
      width: '100%',
      height: '100%',
      zIndex: +`${theme.zIndex.tooltip + 1}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);

export default useStyles;
