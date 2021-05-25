import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listAvatar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
  }),
);

export default useStyles;
