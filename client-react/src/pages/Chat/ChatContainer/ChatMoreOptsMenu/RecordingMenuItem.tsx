import React from 'react';
import { useTranslation } from 'react-i18next';

import { ListItemIcon, ListItemText, MenuItem } from '@material-ui/core';
import { Mic as MicIcon, Send as SendIcon } from '@material-ui/icons';

import useObjState from '~/hooks/useObjState';
import { Toast } from '~/utils/Toast';

interface IOwnState {
  isRecording: boolean;
  noBrowserSupport: boolean;
}
type TState = IOwnState;

const initialState: TState = {
  isRecording: false,
  noBrowserSupport: false,
};

interface IOwnProps {
  saveAudio: (chunks: Blob[]) => void;
  onClose: () => void;
}

type TProps = IOwnProps;

interface AudiData {
  audioChunks: Blob[];
  mediaRecorder?: MediaRecorder;
}

const RecordingMenuItem = ({ saveAudio, onClose }: TProps) => {
  const [state, setState] = useObjState(initialState);
  const audioData = React.useRef<AudiData>({
    audioChunks: [],
    mediaRecorder: undefined,
  });
  const { t: trans } = useTranslation(['Common', 'Errors']);

  const handleGetUserMediaSuccess = (stream: MediaStream) => {
    if (state.noBrowserSupport || state.isRecording) return;

    setState({
      isRecording: true,
    });

    audioData.current.audioChunks = [];

    audioData.current.mediaRecorder = new MediaRecorder(stream);
    audioData.current.mediaRecorder.start();

    audioData.current.mediaRecorder.addEventListener(
      'dataavailable',
      (event: BlobEvent) => {
        if (event.data.size > 0) audioData.current.audioChunks.push(event.data);
      },
    );

    audioData.current.mediaRecorder.addEventListener('stop', () => {
      setState({
        isRecording: false,
      });
      audioData.current.mediaRecorder = undefined;
      saveAudio(audioData.current.audioChunks);
    });
  };

  const handleGetUserMediaFail = (error: Error) => {
    console.error(error);

    if (state.noBrowserSupport || state.isRecording) return;

    if (error.message) {
      Toast.error({ html: error.message });
    }

    onClose();
  };

  const startRecording = async () => {
    if (state.noBrowserSupport || state.isRecording) return;

    if (
      window.navigator.mediaDevices &&
      window.navigator.mediaDevices.getUserMedia
    ) {
      window.navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(handleGetUserMediaSuccess)
        .catch(handleGetUserMediaFail);
    } else {
      setState({
        isRecording: false,
        noBrowserSupport: true,
      });

      Toast.error({
        html: trans("Errors:Your browser doesn't support audio recording."),
      });
    }
  };

  const stopRecording = () => {
    if (state.isRecording) {
      audioData.current.mediaRecorder?.stop();
      setState({
        isRecording: false,
      });
    }
  };

  const onStartRecordingClick = () => {
    if (state.isRecording) stopRecording();
    else startRecording();
  };

  return (
    <MenuItem onClick={onStartRecordingClick} disabled={state.noBrowserSupport}>
      {!state.isRecording && (
        <>
          <ListItemIcon>
            <MicIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={trans('Common:Record')} />
        </>
      )}
      {state.isRecording && (
        <>
          <ListItemIcon>
            <SendIcon fontSize="small" color="secondary" />
          </ListItemIcon>
          <ListItemText
            primary={trans('Common:Send')}
            primaryTypographyProps={{ color: 'secondary' }}
          />
        </>
      )}
    </MenuItem>
  );
};

export type { TProps };
export default RecordingMenuItem;
