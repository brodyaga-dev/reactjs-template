import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

import { Page } from '@/components/Page.tsx';
import { TraffyContainer } from '@/components/TraffyScript/TraffyContainer';

export const TraffyPage: FC = () => {
  return (
    <Page>
      <List>
        <Section header="Traffy Integration">
          <Cell>
            <p className="mb-4">This page demonstrates the Traffy integration for task rewards.</p>
            <TraffyContainer className="w-full" />
          </Cell>
        </Section>
      </List>
    </Page>
  );
};
