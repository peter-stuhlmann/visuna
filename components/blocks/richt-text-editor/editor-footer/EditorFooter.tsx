'use client';

import { FC, MouseEvent } from 'react';
import { Container, FooterInfo, ResizeHandle } from './EditorFooter.styles';
import { FaArrowsUpDown } from 'react-icons/fa6';
import { ModeToggleButton, ModeToggleWrapper } from '../RichTextEditor.styles';

type EditorFooterProps = {
  displayCharCount: number;
  handleResizeMouseDown: (e: MouseEvent<HTMLButtonElement>) => void;
  showHtmlModeToggle: boolean;
  editorMode: 'rich' | 'html';
  handleModeChange: (mode: 'rich' | 'html') => void;
};

export const EditorFooter: FC<EditorFooterProps> = ({
  displayCharCount,
  handleResizeMouseDown,
  showHtmlModeToggle,
  editorMode,
  handleModeChange,
}) => {
  return (
    <Container>
      <div>
        {/* Modus-Toggle (Text / HTML) */}
        {showHtmlModeToggle && (
          <ModeToggleWrapper>
            <ModeToggleButton
              type="button"
              $active={editorMode === 'rich'}
              onClick={() => handleModeChange('rich')}
            >
              Text
            </ModeToggleButton>
            <ModeToggleButton
              type="button"
              $active={editorMode === 'html'}
              onClick={() => handleModeChange('html')}
            >
              HTML
            </ModeToggleButton>
          </ModeToggleWrapper>
        )}
      </div>
      <div>
        <FooterInfo>{displayCharCount} Zeichen</FooterInfo>
        <ResizeHandle
          type="button"
          title="Editor-Höhe anpassen"
          onMouseDown={handleResizeMouseDown}
        >
          <FaArrowsUpDown />
        </ResizeHandle>
      </div>
    </Container>
  );
};
