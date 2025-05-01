import styled from 'styled-components';
import { mergedConfig } from '../../../default.config';

export const AccordionContainer = styled.div<{ $panelBackgroundColor: string }>`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;

  .${mergedConfig.classPrefix}-accordion-item {
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.075);
    border-radius: 1rem;
    background-color: ${({ $panelBackgroundColor }) => $panelBackgroundColor};
  }

  .${mergedConfig.classPrefix}-accordion-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-radius: 1rem;
    background-color: ${({ $panelBackgroundColor }) => $panelBackgroundColor};
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
    font-size: 1rem;
    font-weight: normal;
    font-family: var(--primary-font);

    .${mergedConfig.classPrefix}-accordion-icon {
      transform: rotate(90deg);
      transition: transform 0.3s ease;
    }

    &[aria-expanded='true'] {
      .${mergedConfig.classPrefix}-accordion-icon {
        transform: rotate(270deg);
      }
    }
  }

  .${mergedConfig.classPrefix}-accordion-title {
    font-weight: bold;
  }

  .${mergedConfig.classPrefix}-accordion-content {
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease;
    border-radius: 0 0 1rem 1rem;
    background-color: ${({ $panelBackgroundColor }) => $panelBackgroundColor};
    margin-top: 2px;
    opacity: 0;

    & > div {
      padding: 1rem;
    }
  }
`;
