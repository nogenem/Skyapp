import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      paddingBottom: theme.spacing(3) / 2,
      display: "flex",
      flexDirection: "column"
    }
  })
);

export default useStyles;
