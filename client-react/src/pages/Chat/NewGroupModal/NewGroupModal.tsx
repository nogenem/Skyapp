import React from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, DialogTitle, DialogActions, Button } from '@material-ui/core';

interface IOwnProps {
  isOpen: boolean;
  onClose: () => void;
}

type TProps = IOwnProps;

const NewGroupModal = ({ isOpen, onClose }: TProps) => {
  const { t: trans } = useTranslation(['Common', 'Messages']);

  const handleConfirm = () => {
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="new-group-modal-title"
    >
      <DialogTitle id="new-group-modal-title">
        {trans('Messages:Create a group')}
      </DialogTitle>

      <DialogActions>
        <Button onClick={onClose} color="default">
          {trans('Common:Cancel')}
        </Button>
        <Button onClick={handleConfirm} color="secondary" autoFocus>
          {trans('Common:Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export type { TProps };
export default NewGroupModal;
