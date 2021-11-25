import React, { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@material-ui/core';

import { Alert } from '~/components';
import { IErrors } from '~/utils/handleServerErrors';

const defaultProps = {
  body: 'Messages:Are you sure?',
  errors: {},
};

interface IOwnProps {
  isOpen: boolean;
  errors: IErrors;
  onConfirm: (event: MouseEvent<Element>) => void;
  onClose: (event: MouseEvent<Element>) => void;
}

type TProps = IOwnProps & typeof defaultProps;

const AreYouSureModal = ({
  isOpen,
  body,
  errors,
  onConfirm,
  onClose,
}: TProps) => {
  const { t: trans } = useTranslation(['Common', 'Messages']);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="are-you-sure-modal-title"
      fullWidth
    >
      <DialogTitle id="are-you-sure-modal-title">
        {trans('Messages:Are you sure?')}
      </DialogTitle>

      <DialogContent dividers>
        {errors.global && <Alert>{errors.global}</Alert>}
        <Typography variant="body1" component="p">
          {trans(body)}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="default">
          {trans('Common:Cancel')}
        </Button>
        <Button onClick={onConfirm} color="secondary" autoFocus>
          {trans('Common:Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AreYouSureModal.defaultProps = defaultProps;

export type { TProps };
export default AreYouSureModal;
