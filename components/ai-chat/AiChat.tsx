'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { AI_ICON } from '@/lib/constants';
import { useSelectedWorkspace } from '@/components/workspaces/WorkspaceContext';
import BaseDockButton from '@/components/page-dock-button/BaseDockButton';
import type { ChatMessage, ChatResponse, ToolAction } from './AiChat.types';

// ═══════════════════════════════════════════════════════════════
//  MESSAGE PARSER
// ═══════════════════════════════════════════════════════════════

type Segment =
  | { type: 'text'; content: string }
  | { type: 'success'; content: string }
  | { type: 'error'; content: string }
  | { type: 'buttons'; items: { label: string; message: string }[] }
  | { type: 'choices'; items: { label: string; message: string }[] }
  | { type: 'link'; label: string; href: string };

function parseMessage(raw: string): Segment[] {
  const segments: Segment[] = [];
  const blockRegex = /:::(success|error|buttons|choices|link)\n([\s\S]*?):::/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(raw)) !== null) {
    // Text vor dem Block
    if (match.index > lastIndex) {
      const text = raw.slice(lastIndex, match.index).trim();
      if (text) segments.push({ type: 'text', content: text });
    }

    const kind = match[1] as 'success' | 'error' | 'buttons' | 'choices' | 'link';
    const body = match[2].trim();

    if (kind === 'success' || kind === 'error') {
      segments.push({ type: kind, content: body });
    } else if (kind === 'link') {
      // Link — Format: "Label | /pfad/zur/seite"
      const [label, ...rest] = body.split('|');
      segments.push({
        type: 'link',
        label: label.trim(),
        href: rest.length ? rest.join('|').trim() : '#',
      });
    } else {
      // buttons / choices — Format: "Label | Message" pro Zeile
      const items = body
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, ...rest] = line.split('|');
          return {
            label: label.trim(),
            message: rest.length ? rest.join('|').trim() : label.trim(),
          };
        });
      segments.push({ type: kind, items });
    }

    lastIndex = match.index + match[0].length;
  }

  // Restlicher Text nach letztem Block
  if (lastIndex < raw.length) {
    const text = raw.slice(lastIndex).trim();
    if (text) segments.push({ type: 'text', content: text });
  }

  // Falls kein Block gefunden → ganzer Text als Segment
  if (segments.length === 0) {
    segments.push({ type: 'text', content: raw });
  }

  return segments;
}

// ═══════════════════════════════════════════════════════════════
//  STYLED COMPONENTS
// ═══════════════════════════════════════════════════════════════

const DockPopup = styled.div<{ $width: number; $height: number }>`
  position: relative;
  width: ${({ $width }) => $width}px;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.6);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: ${({ $height }) => $height}px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #0070f3 0%, #0050d0 100%);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NewChatButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  transition: all 0.15s ease;
  white-space: nowrap;
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
`;

const ResizeHandle = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 16px;
  height: 16px;
  cursor: nw-resize;
  z-index: 10;

  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: 8px;
    height: 8px;
    border-top: 2px solid rgba(0, 0, 0, 0.2);
    border-left: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 2px 0 0 0;
  }

  &:hover::after {
    border-color: rgba(0, 0, 0, 0.5);
  }
`;

const MessageBubble = styled.div<{ $role: 'user' | 'assistant' }>`
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 0.85rem;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;

  ${({ $role }) =>
    $role === 'user'
      ? `
    align-self: flex-end;
    background: #0070f3;
    color: white;
    border-bottom-right-radius: 4px;
  `
      : `
    align-self: flex-start;
    background: #f3f4f6;
    color: #111827;
    border-bottom-left-radius: 4px;
  `}
`;

// ── Status Boxes ────────────────────────────────────────────────

const StatusBox = styled.div<{ $variant: 'success' | 'error' }>`
  align-self: flex-start;
  max-width: 90%;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.82rem;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-weight: 500;

  ${({ $variant }) =>
    $variant === 'success'
      ? `
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    color: #065f46;
    border: 1px solid #a7f3d0;
  `
      : `
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    color: #991b1b;
    border: 1px solid #fca5a5;
  `}
`;

const StatusIcon = styled.span`
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 1px;
`;

// ── Action & Choice Buttons ────────────────────────────────────

const ButtonGroup = styled.div`
  align-self: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 90%;
`;

const ActionBtn = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;

  ${({ $variant }) =>
    $variant === 'primary'
      ? `
    background: linear-gradient(135deg, #0070f3 0%, #0050d0 100%);
    color: white;
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 3px 10px rgba(0, 112, 243, 0.3);
    }
  `
      : `
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    &:hover {
      background: #e5e7eb;
      transform: translateY(-1px);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ChoiceBtn = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  background: white;
  color: #1e40af;
  border: 1px solid #bfdbfe;
  text-align: left;

  &:hover {
    background: #eff6ff;
    border-color: #93c5fd;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LinkBtn = styled.button`
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  }
`;

const LinkArrow = styled.span`
  font-size: 1rem;
  transition: transform 0.2s ease;

  ${LinkBtn}:hover & {
    transform: translateX(3px);
  }
`;

// ── Input & Other ──────────────────────────────────────────────

const InputArea = styled.div`
  display: flex;
  padding: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #0070f3;
  }

  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
  }
`;

const SendButton = styled.button`
  padding: 10px 16px;
  background: #0070f3;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #0060df;
  }

  &:disabled {
    background: #93c5fd;
    cursor: not-allowed;
  }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const LoadingDots = styled.div`
  align-self: flex-start;
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
`;

const Dot = styled.div<{ $delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
  animation: dotPulse 1.4s infinite both;
  animation-delay: ${({ $delay }) => $delay}s;

  @keyframes dotPulse {
    0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 16px;
  color: #6b7280;
  font-size: 0.8rem;
  line-height: 1.6;
`;

// ── Cookie-Helpers ──────────────────────────────────────────────
const STORAGE_KEY = 'ai-chat-messages';
const SIZE_COOKIE = 'ai-chat-size';
const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 520;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 350;
const MAX_WIDTH = 800;
const MAX_HEIGHT = 900;

function readSizeCookie(): { w: number; h: number } {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${SIZE_COOKIE}=([^;]*)`));
    if (match) {
      const [w, h] = match[1].split('x').map(Number);
      if (w && h) return { w, h };
    }
  } catch { /* ignore */ }
  return { w: DEFAULT_WIDTH, h: DEFAULT_HEIGHT };
}

function writeSizeCookie(w: number, h: number) {
  document.cookie = `${SIZE_COOKIE}=${w}x${h}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

// ═══════════════════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════════════════

const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isResizing = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── sessionStorage: Messages laden ──────────────────────────
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch { /* ignore */ }

    // Cookie-Größe laden
    const { w, h } = readSizeCookie();
    setPanelWidth(w);
    setPanelHeight(h);
  }, []);

  // ── sessionStorage: Messages speichern ──────────────────────
  useEffect(() => {
    try {
      if (messages.length > 0) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }
    } catch { /* ignore */ }
  }, [messages]);

  // ── Neues Gespräch starten ──────────────────────────────────
  const startNewChat = useCallback(() => {
    setMessages([]);
    setInput('');
    sessionStorage.removeItem(STORAGE_KEY);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // ── Resize per Drag ─────────────────────────────────────────
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = panelWidth;
    const startH = panelHeight;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isResizing.current) return;
      const dw = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startW - (ev.clientX - startX)));
      const dh = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startH - (ev.clientY - startY)));
      setPanelWidth(dw);
      setPanelHeight(dh);
    };

    const onMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      const el = document.querySelector('[data-ai-panel]');
      if (el) {
        const rect = el.getBoundingClientRect();
        writeSizeCookie(Math.round(rect.width), Math.round(rect.height));
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [panelWidth, panelHeight]);

  // WorkspaceId aus URL, Fallback auf Context
  const { selectedWorkspace } = useSelectedWorkspace();
  const workspaceIdFromUrl = pathname?.match(/\/workspaces\/([^/]+)/)?.[1] ?? '';
  const workspaceId = workspaceIdFromUrl || selectedWorkspace?._id || '';

  // ── Aktuellen Seiten-/Element-/Template-Kontext aus URL extrahieren ──
  const getCurrentContext = useCallback(() => {
    const ctx: Record<string, string> = {};

    const pageId = searchParams?.get('pageId');
    const editId = searchParams?.get('editId');
    const mode = searchParams?.get('mode');
    const templateId = searchParams?.get('templateId');

    if (pageId) ctx.pageId = pageId;
    if (editId) ctx.editElementId = editId;
    if (mode) ctx.mode = mode;
    if (templateId) ctx.templateId = templateId;

    // Bereich aus Pfad erkennen (seiten, templates, media, etc.)
    const sectionMatch = pathname?.match(/\/workspaces\/[^/]+\/([^/?]+)/);
    if (sectionMatch) ctx.section = sectionMatch[1];

    // Template-Typ (header, footer, etc.) aus Pfad
    const templateTypeMatch = pathname?.match(/\/templates\/([^/?]+)/);
    if (templateTypeMatch) ctx.templateType = templateTypeMatch[1];

    return Object.keys(ctx).length > 0 ? ctx : undefined;
  }, [pathname, searchParams]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Execute client-side actions
  const executeClientActions = useCallback(
    (actions: ToolAction[]) => {
      for (const action of actions) {
        if (!action.clientAction) continue;
        const { type, payload } = action.clientAction;

        switch (type) {
          case 'navigate':
            router.push(payload.route);
            break;
          case 'set_preview_language':
            window.dispatchEvent(
              new CustomEvent('ai-set-preview-language', { detail: payload })
            );
            break;
          case 'set_preview_device':
            window.dispatchEvent(
              new CustomEvent('ai-set-preview-device', { detail: payload })
            );
            break;
        }
      }
    },
    [router]
  );

  // ── Send message (used by input AND button clicks) ──────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading || !workspaceId) return;

      const userMsg: ChatMessage = { role: 'user', content: text.trim() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput('');
      setLoading(true);

      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/ai-chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages.slice(-10),
            context: getCurrentContext(),
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = (await res.json()) as ChatResponse;

        if (data.actions?.length) {
          executeClientActions(data.actions);

          // Live-Update: Dispatch specific events for each mutation action
          for (const action of data.actions) {
            const { name: actionName, result: actionResult } = action;
            if (!actionResult?.success) continue; // skip failed actions

            switch (actionName) {
              // ── Pages ──────────────────────────────────────────
              case 'create_page':
              case 'duplicate_page':
                window.dispatchEvent(new Event('pages-changed'));
                break;

              case 'delete_page':
                window.dispatchEvent(
                  new CustomEvent('page-deleted', { detail: { pageId: actionResult.pageId } })
                );
                break;

              case 'update_page_status':
                window.dispatchEvent(
                  new CustomEvent('page-publish-status-change', {
                    detail: { pageId: actionResult.pageId, publishStatus: actionResult.newStatus },
                  })
                );
                break;

              // ── Page Elements ──────────────────────────────────
              case 'create_element':
              case 'update_element':
              case 'delete_element':
              case 'toggle_element_visibility':
                // Preview wird über Server Components geladen → router.refresh
                router.refresh();
                break;

              // ── Templates ─────────────────────────────────────
              case 'create_template':
              case 'update_template':
              case 'delete_template':
                window.dispatchEvent(new Event('templates-changed'));
                break;
            }
          }
        }

        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: data.reply || 'Ich konnte keine Antwort generieren.',
        };

        setMessages([...newMessages, assistantMsg]);
      } catch (err) {
        console.error('[AiChat] Fehler:', err);
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: ':::error\nEntschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es erneut.\n:::',
          },
        ]);
      } finally {
        setLoading(false);
        // Focus zurück aufs Input nach dem Senden
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    },
    [messages, loading, workspaceId, executeClientActions]
  );

  const handleSend = () => {
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render a single message with parsed segments ────────────
  const renderAssistantMessage = (content: string) => {
    const segments = parseMessage(content);

    return segments.map((seg, i) => {
      switch (seg.type) {
        case 'text':
          return (
            <MessageBubble key={i} $role="assistant">
              {seg.content}
            </MessageBubble>
          );

        case 'success':
          return (
            <StatusBox key={i} $variant="success">
              <StatusIcon>✅</StatusIcon>
              <span>{seg.content}</span>
            </StatusBox>
          );

        case 'error':
          return (
            <StatusBox key={i} $variant="error">
              <StatusIcon>❌</StatusIcon>
              <span>{seg.content}</span>
            </StatusBox>
          );

        case 'buttons':
          return (
            <ButtonGroup key={i}>
              {seg.items.map((btn, j) => (
                <ActionBtn
                  key={j}
                  $variant={j === 0 ? 'primary' : 'secondary'}
                  disabled={loading}
                  onClick={() => sendMessage(btn.message)}
                >
                  {btn.label}
                </ActionBtn>
              ))}
            </ButtonGroup>
          );

        case 'choices':
          return (
            <ButtonGroup key={i}>
              {seg.items.map((choice, j) => (
                <ChoiceBtn
                  key={j}
                  disabled={loading}
                  onClick={() => sendMessage(choice.message)}
                >
                  {choice.label}
                </ChoiceBtn>
              ))}
            </ButtonGroup>
          );

        case 'link':
          return (
            <LinkBtn key={i} onClick={() => router.push(seg.href)}>
              <span>{seg.label}</span>
              <LinkArrow>→</LinkArrow>
            </LinkBtn>
          );

        default:
          return null;
      }
    });
  };

  // Nicht rendern wenn keine workspaceId
  if (!workspaceId) return null;

  return (
    <BaseDockButton
      id="ai-chat"
      icon={<span style={{ fontSize: 22 }}>{AI_ICON}</span>}
      storageKey="ai-chat-position"
      edgeKey="ai-chat-edge"
      colorKey="ai-chat-color"
      pinnedKey="ai-chat-pinned"
      defaultPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 90 : 1200, y: typeof window !== 'undefined' ? window.innerHeight - 150 : 600 }}
      hidePinButton
      dockSlotIndex={7}
      popupWidth={panelWidth}
    >
      <DockPopup $width={panelWidth} $height={panelHeight} data-ai-panel>
        <ResizeHandle onMouseDown={handleResizeStart} />
        <Header>
          <HeaderTitle>
            <span>{AI_ICON}</span>
            <span>AI-Assistent</span>
          </HeaderTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {messages.length > 0 && (
              <NewChatButton onClick={startNewChat} title="Neues Gespräch starten">
                ✦ Neu
              </NewChatButton>
            )}
          </div>
        </Header>

        <MessagesArea>
          {messages.length === 0 && (
            <WelcomeMessage>
              Hallo! 👋 Ich bin dein AI-Assistent.
              <br />
              Ich kann dir beim Verwalten von Seiten, Elementen und Templates helfen.
              <br />
              <br />
              Probiere z.B.:
              <br />
              <em>&quot;Erstelle eine neue Seite Über uns&quot;</em>
              <br />
              <em>&quot;Finde die Seite mit den Paris-Tipps&quot;</em>
              <br />
              <em>&quot;Geh zum Dashboard&quot;</em>
            </WelcomeMessage>
          )}

          {messages.map((msg, i) =>
            msg.role === 'user' ? (
              <MessageBubble key={i} $role="user">
                {msg.content}
              </MessageBubble>
            ) : (
              <React.Fragment key={i}>
                {renderAssistantMessage(msg.content)}
              </React.Fragment>
            )
          )}

          {loading && (
            <LoadingDots>
              <Dot $delay={0} />
              <Dot $delay={0.2} />
              <Dot $delay={0.4} />
            </LoadingDots>
          )}

          <div ref={messagesEndRef} />
        </MessagesArea>

        <InputArea>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nachricht eingeben..."
            disabled={loading}
          />
          <SendButton onClick={handleSend} disabled={loading || !input.trim()}>
            Senden
          </SendButton>
        </InputArea>
      </DockPopup>
    </BaseDockButton>
  );
};

export default AiChat;
