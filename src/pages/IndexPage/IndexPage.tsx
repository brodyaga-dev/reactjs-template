
import type { FC } from 'react';
import { Page } from '@/components/Page.tsx';
import { TraffyContainer } from '@/components/TraffyScript/TraffyContainer';

export const IndexPage: FC = () => {
  return (
    <Page back={false}>
      {/* Add the TraffyContainer at the top of the page */}
      <div style={{ margin: '20px 0' }}>
        <h2 className="text-xl font-bold mb-4">Traffy Tasks</h2>
        <TraffyContainer minHeight="100px" />
      </div>
    </Page>
  );
};
