import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogPaper: {
      maxHeight: 435,
    },
    listAvatar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    noMargin: {
      margin: 0,
    },
  }),
);

export default useStyles;
