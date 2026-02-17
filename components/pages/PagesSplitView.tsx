'use client';

import { FC, useMemo, useTransition, useEffect, useRef, useState } from 'react';
import {
  Heading,
  Spacer,
  Wrapper,
} from '@/components/content-elements/default';
import { TbLoader2 } from 'react-icons/tb';
import PagesList from '@/components/pages/pages-list/PagesList';
import ResizableSplit from '@/components/ResizableSplit';
import { PageSummary, Page } from '@/lib/workspaces/pages/pages.types';
import { LanguageCode } from '@/components/language-settings/languages';
import { PageElementsProvider, usePageElements } from '@/components/usePageElements';
import { PageProvider } from '@/components/PageContext';
import PreviewContainer from '@/components/PreviewContainer';
import ContentElementSettingsWrapper from '@/components/content-element-settings-wrapper/ContentElementSettingsWrapper';
import { Button } from '@/components/content-elements/default';
import { MdArrowBack } from 'react-icons/md';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import CreatePageElementsList from '@/components/pages/page-elements/components/CreatePageElementsList';
import { AnimatePresence, motion } from 'framer-motion';

type PagesSplitViewProps = {
  workspaceLanguages: LanguageCode[];
  workspaceId: string;
  selectedPageId: string | null;
  selectedPage: Page | null;
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
  })
};

const PagesSplitViewInner: FC<PagesSplitViewProps> = ({ 
  workspaceId, workspaceLanguages, selectedPageId, selectedPage,
  initialSize, initialOrientation, initialFlipped
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const mode = searchParams.get('mode'); // 'edit-element' or null
  const editId = searchParams.get('editId');

  // Direction state: 1 = Down (Next), -1 = Up (Prev), 0 = None
  const [direction, setDirection] = useState(0);

  // Safe usage of context because we are now always wrapped
  const { editingPageElementId, setEditingPageElementId } = usePageElements();
  const [isPending, startTransition] = useTransition();

  // --- Deferred animation: wait after load, then slide ---
  const [animationKey, setAnimationKey] = useState(selectedPageId ?? '');
  const [bufferedElements, setBufferedElements] = useState(selectedPage?.pageElements ?? []);

  // When isPending ends and we have a new page, start the delay timer
  useEffect(() => {
    if (isPending || !selectedPageId || selectedPageId === animationKey) return;
    // DEBUG: 100ms delay after page is loaded, before animation
    const timer = setTimeout(() => {
      setAnimationKey(selectedPageId);
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedPageId, isPending, animationKey]);

  // Update buffered elements only when animation key catches up
  useEffect(() => {
    if (animationKey === selectedPageId && selectedPage) {
      setBufferedElements(selectedPage.pageElements);
    }
  }, [animationKey, selectedPageId, selectedPage]);

  const showSpinner = isPending || selectedPageId !== animationKey;

  const handlePageSelect = (p: PageSummary, idx?: number, prevIdx?: number) => {
    if (typeof idx === 'number' && typeof prevIdx === 'number' && prevIdx !== -1) {
       // Target > Source (e.g. 1 > 0) -> Moving DOWN List -> Content Slides UP (Dir 1)
       // Target < Source (e.g. 0 < 1) -> Moving UP List -> Content Slides DOWN (Dir -1)
       setDirection(idx > prevIdx ? 1 : -1);
    } else {
        setDirection(0);
    }

    const sp = new URLSearchParams(searchParams.toString());
    sp.set('pageId', p._id);
    startTransition(() => {
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    });
  };

  // Sync editId from URL to Context
  useEffect(() => {
    if (editId && editId !== editingPageElementId) {
      setEditingPageElementId(editId);
    } else if (!editId && editingPageElementId) {
      setEditingPageElementId(null);
    }
  }, [editId, editingPageElementId, setEditingPageElementId]);

  const handleBackToList = () => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete('mode');
    sp.delete('editId');
    sp.delete('afterId');
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const Area1Content = useMemo(() => (
    <div style={{ height: '100%' }}>
      {mode === 'edit-element' && editId ? (
        <div style={{ padding: '16px' }}>
          <Button onClick={handleBackToList} variant="text" style={{ paddingLeft: 0, marginBottom: 16 }}>
            <MdArrowBack style={{ marginRight: 8 }} /> Zurück zur Seitenliste
          </Button>
          
          <ContentElementSettingsWrapper
             workspaceId={workspaceId}
             pageId={selectedPageId ?? ''}
             handleCloseModal={handleBackToList}
             onCancel={handleBackToList}
             containerStyle={{ marginTop: 0 }}
          />
        </div>
      ) : mode === 'create-element' ? (
         <div style={{ padding: '16px' }}>
          <Button onClick={handleBackToList} variant="text" style={{ paddingLeft: 0, marginBottom: 16 }}>
            <MdArrowBack style={{ marginRight: 8 }} /> Zurück zur Seitenliste
          </Button>
          <Heading value="Neues Element" element="h2" />
          <Spacer data={{ size: 's' }} />
          
          <CreatePageElementsList
            workspaceId={workspaceId}
            pageId={selectedPageId ?? ''}
            onCreated={(newId) => {
                if (newId) {
                    const sp = new URLSearchParams(searchParams.toString());
                    sp.set('mode', 'edit-element');
                    sp.set('editId', newId);
                    sp.delete('afterId');
                    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
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
                <Heading value="Seiten" element="h1" />
                <Spacer data={{ size: 's' }} />
                <PagesList
                  workspaceId={workspaceId}
                  selectedPageId={selectedPageId}
                  onPageSelect={handlePageSelect}
                />
              </>
            ),
          }}
        />
      )}
    </div>
  ), [mode, editId, selectedPageId, workspaceId, selectedPageId]);

  return (
    <ResizableSplit
      direction="horizontal"
      initialSize={initialSize}
      initialOrientation={initialOrientation}
      initialFlipped={initialFlipped}
      area1Content={Area1Content}
      storageKey="pages-split-view"
      availableLanguages={workspaceLanguages}
      renderArea2={({ ensureVisible }) => {
        if (!selectedPage) {
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
                 <TbLoader2 size={32} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
               ) : (
                 <p>Wähle eine Seite aus, um Details zu sehen.</p>
               )}
            </div>
           );
        }
        
        return (
          <div style={{ height: '100%', backgroundColor: '#f3f4f6', position: 'relative', overflow: 'hidden' }}>
            {showSpinner && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(243,244,246,1)',
                  zIndex: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TbLoader2 size={32} style={{ animation: 'pagespin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite', color: '#6b7280' }} />
                <style jsx>{`
                  @keyframes pagespin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
            
            <AnimatePresence mode='popLayout' initial={false} custom={direction}>
               <motion.div
                 key={animationKey}
                 custom={direction}
                 variants={variants}
                 initial="enter"
                 animate="center"
                 exit="exit"
                 transition={{
                   y: { type: "tween", duration: 0.5, ease: "easeOut" },
                   opacity: { duration: 0.2 }
                 }}
                 style={{ 
                    height: '100%', 
                    width: '100%', 
                    backgroundColor: '#f3f4f6',
                    overflow: 'clip',
                 }}
               >
                 {/** Use a wrapper div for scrolling inside the motion div */}
                 <div style={{ height: '100%', overflowY: 'auto' }}>
                    <PreviewContainer 
                        pageElements={bufferedElements}
                        availableLanguages={workspaceLanguages}
                        onEnsureEditVisible={ensureVisible}
                        isPagePreview
                    />
                 </div>
               </motion.div>
            </AnimatePresence>
          </div>
        );
      }}
      area2Style={{ overflow: 'hidden' }}
      area1Style={{ overflowY: 'auto' }} // Ensure Area 1 only scrolls if needed
    />
  );
};

const PagesSplitView: FC<PagesSplitViewProps> = (props) => {
  return (
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <PageProvider initialPage={props.selectedPage}>
        {/* Important: Do NOT add a key here specifically, so the provider DOES NOT REMOUNT 
            when page changes. Instead, it updates its internal state via useEffect. 
            This keeps the ResizableSplit inside stable.
        */}
        <PageElementsProvider
          initialElements={props.selectedPage?.pageElements ?? []}
        >
          <PagesSplitViewInner {...props} />
        </PageElementsProvider>
      </PageProvider>
    </div>
  );
};

export default PagesSplitView;
