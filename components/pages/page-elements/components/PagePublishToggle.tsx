'use client';

import { FC } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { FiExternalLink } from 'react-icons/fi';

import PageVisibilityStatus, {
} from '@/components/page-visibility-status/PageVisibilityStatus';
import { PageVisibility } from '@/lib/workspaces/pages/pages.types';

type PagePublishToggleProps = {
  pageName: string;
  publishStatus: PageVisibility; // 🔥 3-State
  onChange: (status: PageVisibility) => void;
  pageHref: string;
};

const PagePublishToggle: FC<PagePublishToggleProps> = ({
  pageName,
  publishStatus,
  onChange,
  pageHref,
}) => {
  const isPublic = publishStatus === 'live';

  return (
    <Wrapper>
      <PageVisibilityStatus value={publishStatus} onChange={onChange} />

      {isPublic && (
        <Link
          href={pageHref}
          aria-label={`Zur Live-Seite von "${pageName}" gehen`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FiExternalLink aria-hidden="true" />
        </Link>
      )}
    </Wrapper>
  );
};

export default PagePublishToggle;

const Wrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 20px;
`;
