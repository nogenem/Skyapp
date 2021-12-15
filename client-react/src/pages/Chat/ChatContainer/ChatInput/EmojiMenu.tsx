import React, { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import { Menu, MenuItem } from '@material-ui/core';
import { BaseEmoji, CategoryName, Picker } from 'emoji-mart';

import { IAppState } from '~/redux/store';
import { selectThemeMode } from '~/redux/theme/selectors';

import useStyles from './useStyles';

import 'emoji-mart/css/emoji-mart.css';

const mapStateToProps = (state: IAppState) => ({
  themeMode: selectThemeMode(state),
});
const connector = connect(mapStateToProps, {});
type TPropsFromRedux = ConnectedProps<typeof connector>;

interface IOwnProps {
  anchor: Element | null;
  onSelectEmoji: (emoji: string) => void;
  handleMenuClose: (event: MouseEvent<Element>, reason: string) => void;
}

type TProps = IOwnProps & TPropsFromRedux;

const EXCLUDED_EMOJIS = ['flags'] as CategoryName[];

const EmojiMenu = ({
  anchor,
  onSelectEmoji,
  handleMenuClose,
  themeMode,
}: TProps) => {
  const { t: trans } = useTranslation(['Common', 'Messages']);
  const classes = useStyles();

  const emojiMartI18n = React.useMemo(
    () => ({
      search: trans('Common:Search'),
      clear: trans('Common:Clear'),
      notfound: trans('Messages:No Emoji Found'),
      categories: {
        search: trans('Messages:Search Results'),
        recent: trans('Messages:Frequently Used'),
        smileys: trans('Messages:Smileys & Emotion'),
        people: trans('Messages:People & Body'),
        nature: trans('Messages:Animals & Nature'),
        foods: trans('Messages:Food & Drink'),
        activity: trans('Common:Activity'),
        places: trans('Messages:Travel & Places'),
        objects: trans('Common:Objects'),
        symbols: trans('Common:Symbols'),
        flags: trans('Common:Flags'),
        custom: trans('Common:Custom'),
      },
      categorieslabel: trans('Messages:Emoji categories'),
    }),
    [trans],
  );

  const onEmojiClick = (emojiObject: BaseEmoji) => {
    onSelectEmoji(emojiObject.native);
  };

  return (
    <Menu
      transformOrigin={{
        vertical: 225,
        horizontal: 0,
      }}
      id="emoji-menu"
      anchorEl={anchor}
      open={Boolean(anchor)}
      onClose={handleMenuClose}
    >
      <MenuItem disableRipple className={classes.emojiMenuItem}>
        <Picker
          onSelect={onEmojiClick}
          native
          showPreview={false}
          showSkinTones={false}
          emojiTooltip
          theme={themeMode}
          set="google"
          sheetSize={16}
          perLine={7}
          exclude={EXCLUDED_EMOJIS}
          i18n={emojiMartI18n}
        />
      </MenuItem>
    </Menu>
  );
};

export type { TProps };
export const UnconnectedEmojiMenu = EmojiMenu;
export default connector(EmojiMenu);
