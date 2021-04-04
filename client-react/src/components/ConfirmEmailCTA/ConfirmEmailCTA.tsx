import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Card, CardHeader, CardContent, Typography } from '@material-ui/core';

import useStyles from './useStyles';

const ConfirmEmailCTA = () => {
  const { t: trans } = useTranslation('Messages');
  const classes = useStyles();

  return (
    <div className={classes.content}>
      <Card raised>
        <CardHeader title={trans('Messages:Confirm your email')} />
        <CardContent classes={{ root: classes.cardContent }}>
          <Typography variant="body1" component="p">
            <Trans t={trans} i18nKey="Messages:confirmEmailCTA">
              Please, follow the instructions in the email that we sent to you.
              <br />
              That is a necessary step for you to be able to use our chat
              system.
            </Trans>
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmailCTA;
