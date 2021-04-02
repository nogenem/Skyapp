import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    badge: {
      alignItems: 'center',
    },
    dotBadge: {
      height: '10px',
      minWidth: '10px',
      border: `2px solid ${theme.palette.background.default}`,
      borderRadius: '50%',
    },
    dotBadge_online: {
      backgroundColor: '#44b700',
    },
    dotBadge_offline: {
      backgroundColor: '#f44336',
    },
    anchorOriginBottomRightCircle: {
      bottom: '18%',
    },
  }),
);

export default useStyles;
