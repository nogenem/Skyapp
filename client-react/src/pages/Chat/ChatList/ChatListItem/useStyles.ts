import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatarContainer: {
      marginRight: theme.spacing(1),
    },
    textContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
    },
    secondaryText: {
      width: '90%',
    },
    secondaryTextIcon: {
      position: 'relative',
      top: '1px',
      width: theme.typography.body2.fontSize,
      height: theme.typography.body2.fontSize,
    },
    unreadBadge: {
      marginLeft: '15px',
      marginRight: '9px',
    },
  }),
);

export default useStyles;
