import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chatsText: {
      fontWeight: 'bold',
    },
  }),
);

export default useStyles;
