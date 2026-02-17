'use client';

import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BlockWrapper } from '../BlockWrapper.styles';
import styled, { css } from 'styled-components';
import { TbRadiusTopRight } from 'react-icons/tb';
import {
  IoIosArrowBack,
  IoIosArrowDown,
  IoIosArrowForward,
  IoIosArrowUp,
} from 'react-icons/io';
import { RxWidth } from 'react-icons/rx';
import { MdOutlineFormatColorFill } from 'react-icons/md';

import SelectInput from '@/components/content-elements/default/inputs/select-input';
import ColorInput from '@/components/content-elements/default/inputs/color-input';

type SizeOption = 'none' | 's' | 'm' | 'l' | 'xl';
type WidthOption = 's' | 'm' | 'l' | 'xl' | 'full';
type RadiusOption = 'none' | 's' | 'm' | 'l' | 'xl';

export type ElementLayoutValue = {
  outerWidth: WidthOption | '';
  innerWidth: WidthOption | '';

  outerBackgroundColor: string | '';
  innerBackgroundColor: string | '';

  outerBorderRadius: RadiusOption | '';
  innerBorderRadius: RadiusOption | '';

  outerMarginTop: SizeOption | '';
  outerMarginBottom: SizeOption | '';

  outerPaddingTop: SizeOption | '';
  outerPaddingRight: SizeOption | '';
  outerPaddingBottom: SizeOption | '';
  outerPaddingLeft: SizeOption | '';

  innerPaddingTop: SizeOption | '';
  innerPaddingRight: SizeOption | '';
  innerPaddingBottom: SizeOption | '';
  innerPaddingLeft: SizeOption | '';
};

type FieldKey = keyof ElementLayoutValue;

// ... (imports remain same)

// ...

type ElementLayoutBlockProps = {
  value: ElementLayoutValue | null;
  onChange: (value: ElementLayoutValue) => void;
  label: string;
  /** ISO 'YYYY-MM-DD' */
  min?: string;
  max?: string;
  allowedKeys?: string[];
};

// ... (options definition)
const outerWidthOptions = [
  { label: 'Klein', value: 's' },
  { label: 'Mittel', value: 'm' },
  { label: 'Groß', value: 'l' },
  { label: 'Extra Groß', value: 'xl' },
  { label: 'Voll', value: 'full' },
] as const;

const innerWidthOptions = outerWidthOptions;

const paddingOptions = [
  { label: 'Kein', value: 'none' },
  { label: 'Klein', value: 's' },
  { label: 'Mittel', value: 'm' },
  { label: 'Groß', value: 'l' },
  { label: 'Extra Groß', value: 'xl' },
] as const;

const marginOptions = paddingOptions;

const radiusOptions = [
  { label: 'Kein', value: 'none' },
  { label: 'Klein', value: 's' },
  { label: 'Mittel', value: 'm' },
  { label: 'Groß', value: 'l' },
  { label: 'Extra Groß', value: 'xl' },
] as const;

const DEFAULT_VALUE: ElementLayoutValue = {
  outerWidth: 'full',
  innerWidth: 'xl',

  outerBackgroundColor: 'transparent',
  innerBackgroundColor: 'transparent',

  outerBorderRadius: 'none',
  innerBorderRadius: 'none',

  outerMarginTop: 'none',
  outerMarginBottom: 'none',

  outerPaddingTop: 'm',
  outerPaddingRight: 'none',
  outerPaddingBottom: 'm',
  outerPaddingLeft: 'none',

  innerPaddingTop: 'm',
  innerPaddingRight: 'm',
  innerPaddingBottom: 'm',
  innerPaddingLeft: 'm',
};

type SelectDef =
  | {
      key: FieldKey;
      label: string;
      kind: 'select';
      options: readonly { label: string; value: string }[];
    }
  | {
      key: FieldKey;
      label: string;
      kind: 'color';
    };

const ElementLayoutBlock: FC<ElementLayoutBlockProps> = ({
  value,
  onChange,
  label,
  allowedKeys,
}) => {
  // ✅ immer vollständiges Objekt (Defaults + incoming)
  const v: ElementLayoutValue = useMemo(() => {
    const incoming =
      value && typeof value === 'object'
        ? (value as Partial<ElementLayoutValue>)
        : {};
    return { ...DEFAULT_VALUE, ...incoming };
  }, [value]);

  // ✅ sorgt dafür, dass layout nicht "null" bleibt, auch wenn eure Form-Defaults nicht angewandt werden
  useEffect(() => {
    if (value == null) onChange({ ...DEFAULT_VALUE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeField, setActiveField] = useState<FieldKey | null>(null);
  const [hoverField, setHoverField] = useState<FieldKey | null>(null);

  const rightColumnRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Partial<Record<FieldKey, HTMLDivElement | null>>>({});

  const isActive = useCallback(
    (k: FieldKey) => activeField === k,
    [activeField]
  );
  const isHover = useCallback((k: FieldKey) => hoverField === k, [hoverField]);

  const update = useCallback(
    (key: FieldKey, next: string) => {
      const nextValue: ElementLayoutValue = {
        ...v,
        [key]: next as ElementLayoutValue[FieldKey],
      };
      onChange(nextValue);
    },
    [onChange, v]
  );

  const isFieldVisible = useCallback(
    (key: string) => {
      if (!allowedKeys || allowedKeys.length === 0) return true;
      return allowedKeys.includes(key);
    },
    [allowedKeys]
  );

  const selectDefs: readonly SelectDef[] = useMemo(
    () =>
      [
        // Outer
        {
          key: 'outerWidth',
          label: 'Äußere Breite',
          kind: 'select',
          options: outerWidthOptions as unknown as readonly {
            label: string;
            value: string;
          }[],
        },
        // ... (rest of items)
        {
          key: 'outerBackgroundColor',
          label: 'Äußere Hintergrundfarbe',
          kind: 'color',
        },
        {
          key: 'outerBorderRadius',
          label: 'Äußerer Radius',
          kind: 'select',
          options: radiusOptions as unknown as readonly {
            label: string;
            value: string;
          }[],
        },
        {
          key: 'outerMarginTop',
          label: 'Äußerer Margin oben',
          kind: 'select',
          options: marginOptions as unknown as readonly {
            label: string;
            value: string;
          }[],
        },
        {
          key: 'outerMarginBottom',
          label: 'Äußerer Margin unten',
          kind: 'select',
          options: marginOptions as unknown as readonly {
            label: string;
            value: string;
          }[],
        },
        {
          key: 'outerPaddingTop',
          label: 'Äußeres Padding oben',
          kind: 'select',
          options: paddingOptions as unknown as readonly {
            label: string;
            value: string;
          }[],
        },
        {
          key: 'outerPaddingRight',
          label: 'Äußeres Padding rechts',
          kind: 'select',
          options: paddingOptions as unknown as readonly {
            label: string;
            value: string;
          }[],
        },
        {
          key: 'outerPaddingBottom',
          label: 'Äußeres Padding unten',
          kind: 'select',
          options: paddingOptions as unknown as readonly {
            label: string;
            value: string;
          }[],
        },
        {
          key: 'outerPaddingLeft',
          label: 'Äußeres Padding links',
          kind: 'select',
          options: paddingOptions as unknown as readonly {
            label: string;
            value: string;
          }[],
        },

        // Inner
        {
          key: 'innerWidth',
          label: 'Innere Breite',
          kind: 'select',
          options: innerWidthOptions as unknown as readonly {
            label: string;
            value: string;
          }[],
        },
        {
          key: 'innerBackgroundColor',
          label: 'Innere Hintergrundfarbe',
          kind: 'color',
        },
        {
          key: 'innerBorderRadius',
          label: 'Innerer Radius',
          kind: 'select',
          options: radiusOptions as unknown as readonly {
            label: string;
            value: string;
          }[],
        },
        {
          key: 'innerPaddingTop',
          label: 'Inneres Padding oben',
          kind: 'select',
          options: paddingOptions as unknown as readonly {
            label: string;
            value: string;
          }[],
        },
        {
          key: 'innerPaddingRight',
          label: 'Inneres Padding rechts',
          kind: 'select',
          options: paddingOptions as unknown as readonly {
            label: string;
            value: string;
          }[],
        },
        {
          key: 'innerPaddingBottom',
          label: 'Inneres Padding unten',
          kind: 'select',
          options: paddingOptions as unknown as readonly {
            label: string;
            value: string;
          }[],
        },
        {
          key: 'innerPaddingLeft',
          label: 'Inneres Padding links',
          kind: 'select',
          options: paddingOptions as unknown as readonly {
            label: string;
            value: string;
          }[],
        },
      ].filter((def) => isFieldVisible(def.key)) as SelectDef[],
    [isFieldVisible]
  );

  // ✅ klick Icon => aktiv setzen + scrollen (Row möglichst oben)
  const activateAndScroll = useCallback((key: FieldKey) => {
    setActiveField(key);

    const container = rightColumnRef.current;
    const rowEl = rowRefs.current[key];
    if (!container || !rowEl) return;

    const TOP_PADDING = 8;

    const containerRect = container.getBoundingClientRect();
    const rowRect = rowEl.getBoundingClientRect();

    const currentScrollTop = container.scrollTop;
    const rowTopInContainer =
      rowRect.top - containerRect.top + currentScrollTop;

    container.scrollTo({
      top: Math.max(0, rowTopInContainer - TOP_PADDING),
      behavior: 'smooth',
    });
  }, []);

  // ✅ Helper: reduce repetitive handlers
  const hoverHandlers = useCallback(
    (key: FieldKey) => ({
      onMouseEnter: () => setHoverField(key),
      onMouseLeave: () => setHoverField(null),
      onClick: () => activateAndScroll(key),
    }),
    [activateAndScroll]
  );

  const renderIconButton = (key: FieldKey, child: React.ReactNode) => {
     if (!isFieldVisible(key)) return null;
     
     // Special casting for styled component prop
     const typeProp = key as any; 

     return (
        <IconButton
            $type={typeProp}
            $active={isActive(key)}
            $hovered={isHover(key)}
            {...hoverHandlers(key)}
        >
            {child}
        </IconButton>
     );
  };

  const outerKeys: FieldKey[] = useMemo(() => [
    'outerWidth', 'outerBackgroundColor', 'outerBorderRadius',
    'outerMarginTop', 'outerMarginBottom',
    'outerPaddingTop', 'outerPaddingRight', 'outerPaddingBottom', 'outerPaddingLeft'
  ], []);

  const innerKeys: FieldKey[] = useMemo(() => [
    'innerWidth', 'innerBackgroundColor', 'innerBorderRadius',
    'innerPaddingTop', 'innerPaddingRight', 'innerPaddingBottom', 'innerPaddingLeft'
  ], []);

  const showOuter = !allowedKeys || allowedKeys.length === 0 || outerKeys.some(k => allowedKeys.includes(k));
  const showInner = !allowedKeys || allowedKeys.length === 0 || innerKeys.some(k => allowedKeys.includes(k));

  return (
    <BlockWrapper>
      <div>{label}</div>

      <Container>
        <div>
          {showOuter && (
            <>
              <Title>Äußerer Container</Title>
              <ElementLayoutContainer $type="outerBox">
                <div className="outerBox">
                  <div className="innerBox">
                    <div className="content" />
                  </div>

                  {renderIconButton('outerWidth', <RxWidth />)}
                  {renderIconButton('outerBackgroundColor', <MdOutlineFormatColorFill />)}
                  {renderIconButton('outerBorderRadius', <TbRadiusTopRight />)}
                  {renderIconButton('outerMarginTop', <IoIosArrowUp />)}
                  {renderIconButton('outerMarginBottom', <IoIosArrowDown />)}
                  {renderIconButton('outerPaddingTop', <IoIosArrowUp />)}
                  {renderIconButton('outerPaddingRight', <IoIosArrowForward />)}
                  {renderIconButton('outerPaddingBottom', <IoIosArrowDown />)}
                  {renderIconButton('outerPaddingLeft', <IoIosArrowBack />)}
                </div>
              </ElementLayoutContainer>
            </>
          )}

          {showInner && (
            <>
              <Title>Innerer Container</Title>
              <ElementLayoutContainer $type="innerBox">
                <div className="outerBox">
                  <div className="innerBox">
                    <div className="content">
                      {renderIconButton('innerWidth', <RxWidth />)}
                      {renderIconButton('innerBackgroundColor', <MdOutlineFormatColorFill />)}
                    </div>
                    {renderIconButton('innerBorderRadius', <TbRadiusTopRight />)}
                    {renderIconButton('innerPaddingTop', <IoIosArrowUp />)}
                    {renderIconButton('innerPaddingRight', <IoIosArrowForward />)}
                    {renderIconButton('innerPaddingBottom', <IoIosArrowDown />)}
                    {renderIconButton('innerPaddingLeft', <IoIosArrowBack />)}
                  </div>
                </div>
              </ElementLayoutContainer>
            </>
          )}
        </div>

        <RightColumn ref={rightColumnRef}>
          {selectDefs.map((def) => {
            const key = def.key;

            return (
              <SelectRow
                key={key}
                ref={(el) => {
                  rowRefs.current[key] = el;
                }}
                $active={isActive(key)}
                $hovered={isHover(key)}
                onMouseEnter={() => setHoverField(key)}
                onMouseLeave={() => setHoverField(null)}
                onClick={() => setActiveField(key)}
              >
                {def.kind === 'color' ? (
                  <ColorInput
                    label={def.label}
                    value={(v[key] as string) ?? ''}
                    onChange={(next: string) => update(key, next)}
                  />
                ) : (
                  <SelectInput
                    label={def.label}
                    value={(v[key] as string) ?? ''}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                      update(key, e.target.value)
                    }
                    options={def.options.map((opt) => ({
                      label: opt.label,
                      value: opt.value,
                    }))}
                  />
                )}
              </SelectRow>
            );
          })}
        </RightColumn>
      </Container>
    </BlockWrapper>
  );
};

export default ElementLayoutBlock;

const Container = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 50px;

  @container (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;

  max-height: 565px;
  overflow: auto;
  padding-right: 6px;
`;

const highlightActive = css`
  border: 2px solid #2f6fff !important;

  &:focus-within {
    outline: 0;
  }
`;

const highlightHover = css``;

const SelectRow = styled.div<{ $active?: boolean; $hovered?: boolean }>`
  transition: 120ms ease;

  & > div > div {
    ${({ $active }) => $active && highlightActive}
    ${({ $hovered, $active }) => $hovered && !$active && highlightHover}
  }
`;

const ElementLayoutContainer = styled.div<{
  $outerBorderRadius?: string;
  $innerBorderRadius?: string;
  $type?: 'outerBox' | 'innerBox';
}>`
  height: 200px;
  width: 100%;
  margin-bottom: 70px;

  .outerBox {
    background-color: ${({ $type }) =>
      $type === 'outerBox' ? '#333333' : '#ededed'};
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: ${({ $outerBorderRadius }) => $outerBorderRadius || '8px'};
    width: 100%;
    max-width: 100%;
    height: 100%;
    position: relative;
  }

  .innerBox {
    position: relative;
    background-color: ${({ $type }) =>
      $type === 'innerBox' ? '#333333' : '#ededed'};
    border-radius: 8px;
    padding-top: 8px;
    padding-right: 8px;
    padding-bottom: 8px;
    padding-left: 8px;
    width: 50%;
    max-width: 100%;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;

    .content {
      width: 100%;
      height: 100%;
      border: 2px dashed #ffffff;
      color: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }
  }
`;

const IconButton = styled.button<{
  $type:
    | 'outerBackgroundColor'
    | 'innerBackgroundColor'
    | 'outerWidth'
    | 'innerWidth'
    | 'outerBorderRadius'
    | 'innerBorderRadius'
    | 'innerPaddingTop'
    | 'innerPaddingRight'
    | 'innerPaddingBottom'
    | 'innerPaddingLeft'
    | 'outerPaddingTop'
    | 'outerPaddingRight'
    | 'outerPaddingBottom'
    | 'outerPaddingLeft'
    | 'outerMarginTop'
    | 'outerMarginBottom';
  $active?: boolean;
  $hovered?: boolean;
}>`
  position: absolute;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  transform: translate(-50%, -50%);
  cursor: pointer;
  background: #fff;
  transition: 120ms ease;

  ${({ $active }) =>
    $active &&
    `${highlightActive} background: #2f6fff; svg { color: #fff !important; }`}
  ${({ $hovered, $active }) => $hovered && !$active && highlightHover}

  ${({ $type }) =>
    $type === 'outerBackgroundColor' && 'bottom: -5px; right: 0;'}
  ${({ $type }) =>
    $type === 'innerBackgroundColor' && 'bottom: -10px; right: -5px;'}
  ${({ $type }) => $type === 'outerWidth' && 'bottom: -75px; left: 50%;'}
  ${({ $type }) => $type === 'innerWidth' && 'bottom: 25px; left: 50%;'}
  ${({ $type }) => $type === 'outerBorderRadius' && 'top: -11px; right: -37px;'}
  ${({ $type }) => $type === 'innerBorderRadius' && 'top: -11px; right: -37px;'}
  ${({ $type }) => $type === 'innerPaddingTop' && 'top: 25px; left: 50%;'}
  ${({ $type }) => $type === 'innerPaddingRight' && 'top: 50%; right: 5px;'}
  ${({ $type }) => $type === 'innerPaddingBottom' && 'bottom: 0; left: 50%;'}
  ${({ $type }) => $type === 'innerPaddingLeft' && 'top: 50%; left: 30px;'}
  ${({ $type }) => $type === 'outerPaddingTop' && 'top: 20px; left: 50%;'}
  ${({ $type }) => $type === 'outerPaddingRight' && 'top: 50%; right: 0;'}
  ${({ $type }) => $type === 'outerPaddingBottom' && 'bottom: -5px; left: 50%;'}
  ${({ $type }) => $type === 'outerPaddingLeft' && 'top: 50%; left: 25px;'}
  ${({ $type }) => $type === 'outerMarginTop' && 'top: -20px; left: 50%;'}
  ${({ $type }) => $type === 'outerMarginBottom' && 'bottom: -45px; left: 50%;'}

  svg {
    color: #000;
  }
`;

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 22px;
`;

