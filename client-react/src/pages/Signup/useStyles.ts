import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      flexGrow: 1
    },
    container: {
      maxWidth: "500px"
    },
    paper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main
    }
  })
);

export default useStyles;
