import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dot: {
      height: '14px',
      minWidth: '14px',
      border: `2px solid ${theme.palette.background.default}`,
      borderRadius: '50%',
      position: 'relative',
    },
    dot_active: {
      backgroundColor: '#44b700',
    },
    dot_away: {
      backgroundColor: '#FFBA00',

      '&::before': {
        content: "''",
        position: 'absolute',

        backgroundColor: 'white',
        width: '1px',
        height: '5px',
        top: '5px',
        left: '5px',
        transform: 'translate(-50%, -88%)',
      },
      '&::after': {
        content: "''",
        position: 'absolute',

        backgroundColor: 'white',
        width: '1px',
        height: '4px',
        top: '5px',
        left: '5px',
        transform: 'translate(100%, -16%) rotate(120deg)',
      },
    },
    dot_do_not_disturb: {
      backgroundColor: '#f44336',

      '&::after': {
        content: "''",
        position: 'absolute',

        backgroundColor: 'white',
        width: '6px',
        height: '1px',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      },
    },
    dot_invisible: {
      backgroundColor: 'white',
    },
    dot_offline: {
      backgroundColor: '#f44336',
    },
  }),
);

export default useStyles;
