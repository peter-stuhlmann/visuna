'use client';

import { FC, useMemo, useEffect, useTransition, useState } from 'react';
import {
  Heading,
  Spacer,
  Wrapper,
  Button,
} from '@/components/content-elements/default';
import { TbLoader2 } from 'react-icons/tb';
import { MdArrowBack } from 'react-icons/md';
import ResizableSplit from '@/components/ResizableSplit';
import TemplatesList from './TemplatesList';
import CreateTemplateElementsList from './CreateTemplateElementsList';
import type { TemplateSummary, TemplateDB } from '@/lib/workspaces/templates/templates.types';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PageElementsProvider, usePageElements } from '@/components/usePageElements';
import PreviewContainer from '@/components/PreviewContainer';
import ContentElementSettingsWrapper from '@/components/content-element-settings-wrapper/ContentElementSettingsWrapper';
import { AnimatePresence, motion } from 'framer-motion';
import { PageElement } from '@/lib/workspaces/pages/page-elements/page-elements.types';
import { ElementApiProvider } from '@/components/ElementApiContext';
import { PageProvider } from '@/components/PageContext';
import type { Page } from '@/lib/workspaces/pages/pages.types';

type TemplatesSplitViewProps = {
  templates: TemplateSummary[];
  workspaceId: string;
  templateType: string;
  templateLabel: string;
  selectedTemplateId?: string | null;
  selectedTemplate?: TemplateDB | null;
  initialSize?: number;
  initialOrientation?: 'horizontal' | 'vertical';
  initialFlipped?: boolean;
};

const variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? '100%' : '-100%',
    opacity: 1,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? '-100%' : '100%',
    opacity: 1,
    position: 'absolute' as any,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  }),
};

const TemplatesSplitViewInner: FC<TemplatesSplitViewProps> = ({
  templates,
  workspaceId,
  templateType,
  templateLabel,
  selectedTemplateId,
  selectedTemplate,
  initialSize,
  initialOrientation,
  initialFlipped,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const mode = searchParams.get('mode'); // 'edit-element' | 'create-element' | null
  const editId = searchParams.get('editId');

  const [direction, setDirection] = useState(0);

  const { editingPageElementId, setEditingPageElementId } = usePageElements();

  // Sync editId from URL to Context
  useEffect(() => {
    if (editId && editId !== editingPageElementId) {
      setEditingPageElementId(editId);
    } else if (!editId && editingPageElementId) {
      setEditingPageElementId(null);
    }
  }, [editId, editingPageElementId, setEditingPageElementId]);

  const handleTemplateSelect = (t: TemplateSummary, idx?: number, prevIdx?: number) => {
    if (typeof idx === 'number' && typeof prevIdx === 'number' && prevIdx !== -1) {
      setDirection(idx > prevIdx ? 1 : -1);
    } else {
      setDirection(0);
    }

    const sp = new URLSearchParams(searchParams.toString());
    sp.set('templateId', t._id);
    // Clear edit mode when selecting a different template
    sp.delete('mode');
    sp.delete('editId');
    sp.delete('afterId');
    startTransition(() => {
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    });
  };

  const handleBackToList = () => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete('mode');
    sp.delete('editId');
    sp.delete('afterId');
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const Area1Content = useMemo(
    () => (
      <div style={{ height: '100%' }}>
        {mode === 'edit-element' && editId ? (
          <div style={{ padding: '16px' }}>
            <Button
              onClick={handleBackToList}
              variant="text"
              style={{ paddingLeft: 0, marginBottom: 16 }}
            >
              <MdArrowBack style={{ marginRight: 8 }} /> Zurück zur
              Template-Liste
            </Button>

            <ContentElementSettingsWrapper
              workspaceId={workspaceId}
              pageId={selectedTemplateId ?? ''}
              handleCloseModal={handleBackToList}
              onCancel={handleBackToList}
              containerStyle={{ marginTop: 0 }}
            />
          </div>
        ) : mode === 'create-element' ? (
          <div style={{ padding: '16px' }}>
            <Button
              onClick={handleBackToList}
              variant="text"
              style={{ paddingLeft: 0, marginBottom: 16 }}
            >
              <MdArrowBack style={{ marginRight: 8 }} /> Zurück zur
              Template-Liste
            </Button>
            <Heading value="Neues Element" element="h2" />
            <Spacer data={{ size: 's' }} />

            <CreateTemplateElementsList
              workspaceId={workspaceId}
              templateId={selectedTemplateId ?? ''}
              onCreated={(newId) => {
                if (newId) {
                  const sp = new URLSearchParams(searchParams.toString());
                  sp.set('mode', 'edit-element');
                  sp.set('editId', newId);
                  sp.delete('afterId');
                  router.replace(`${pathname}?${sp.toString()}`, {
                    scroll: false,
                  });
                } else {
                  handleBackToList();
                }
              }}
            />
          </div>
        ) : (
          <Wrapper
            data={{
              layout: {
                outerWidth: 'full',
                innerWidth: 'xl',
                innerPaddingLeft: 'm',
                innerPaddingRight: 'm',
                innerPaddingTop: 'm',
                innerPaddingBottom: 'm',
              },
              children: (
                <>
                  <Heading value={templateLabel} element="h1" />
                  <Spacer data={{ size: 's' }} />
                </>
              ),
            }}
          />
        )}
        {/* Always render templates list when not in create/edit mode */}
        {!mode && (
          <TemplatesList
            templates={templates}
            workspaceId={workspaceId}
            templateType={templateType}
            templateLabel={templateLabel}
            selectedId={selectedTemplateId}
            onSelect={handleTemplateSelect}
          />
        )}
      </div>
    ),
    [
      mode,
      editId,
      selectedTemplateId,
      templates,
      workspaceId,
      templateType,
      templateLabel,
    ]
  );

  return (
    <ResizableSplit
      direction="horizontal"
      initialSize={initialSize}
      initialOrientation={initialOrientation}
      initialFlipped={initialFlipped}
      area1Content={Area1Content}
      storageKey={`templates-${templateType}-split-view`}
      availableLanguages={['de']}
      renderArea2={({ ensureVisible }) => {
        if (!selectedTemplate) {
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#6b7280',
                textAlign: 'center',
                padding: '24px',
                backgroundColor: '#f9fafb',
              }}
            >
              {isPending ? (
                <TbLoader2
                  size={32}
                  style={{ animation: 'spin 1s linear infinite' }}
                />
              ) : (
                <p>
                  Wähle ein {templateLabel}-Template aus, um Details zu sehen.
                </p>
              )}
            </div>
          );
        }

        // Get elements from the template's data array
        const templateElements: PageElement[] = Array.isArray(
          selectedTemplate.data
        )
          ? selectedTemplate.data
          : [];

        return (
          <div
            style={{
              height: '100%',
              backgroundColor: '#f3f4f6',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {isPending && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  zIndex: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(1px)',
                }}
              >
                <TbLoader2
                  size={32}
                  style={{ animation: 'spin 1s linear infinite' }}
                />
                <style jsx>{`
                  @keyframes spin {
                    from {
                      transform: rotate(0deg);
                    }
                    to {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
              </div>
            )}

            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={selectedTemplate._id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  y: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                style={{
                  height: '100%',
                  width: '100%',
                  backgroundColor: '#f3f4f6',
                  overflow: 'hidden',
                }}
              >
                <div style={{ height: '100%', overflowY: 'auto' }}>
                  <PreviewContainer
                    pageElements={templateElements}
                    availableLanguages={['de']}
                    onEnsureEditVisible={ensureVisible}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        );
      }}
      area2Style={{ overflow: 'hidden' }}
      area1Style={{ overflowY: 'auto' }}
    />
  );
};

const TemplatesSplitView: FC<TemplatesSplitViewProps> = (props) => {
  const templateElements: PageElement[] = Array.isArray(props.selectedTemplate?.data)
    ? props.selectedTemplate!.data
    : [];

  // Create a fake Page object so usePage()/PreviewContainer work correctly
  const fakePage: Page | null = props.selectedTemplate
    ? {
        _id: props.selectedTemplate._id,
        workspaceId: props.workspaceId,
        name: props.selectedTemplate.name,
        slug: '',
        pageElements: templateElements,
        publishStatus: props.selectedTemplate.publishStatus === 'active' ? 'live' : 'offline',
        createdAt: props.selectedTemplate.createdAt,
      } as Page
    : null;

  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <PageProvider initialPage={fakePage}>
        <ElementApiProvider
          workspaceId={props.workspaceId}
          entityId={props.selectedTemplateId ?? ''}
          entityType="template"
          entityLabel={props.templateLabel}
        >
          <PageElementsProvider initialElements={templateElements}>
            <TemplatesSplitViewInner {...props} />
          </PageElementsProvider>
        </ElementApiProvider>
      </PageProvider>
    </div>
  );
};

export default TemplatesSplitView;
