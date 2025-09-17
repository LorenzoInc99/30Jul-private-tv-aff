'use client';

import HeaderLogo from './HeaderLogo';
import HeaderTimezoneSelector from '../../components/HeaderTimezoneSelector';
import MobileCompetitionsMenu from './MobileCompetitionsMenu';

export default function HeaderClient({ competitions }: { competitions: any[] }) {
  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm h-16 flex items-center px-2 md:px-8">
      <div className="flex justify-between items-center w-full">
        <HeaderLogo />
        <div className="flex items-center gap-4">
          {/* Timezone Selector */}
          <HeaderTimezoneSelector />
          {/* Hamburger menu for mobile */}
          <div className="md:hidden">
            <MobileCompetitionsMenu competitions={competitions || []} />
          </div>
        </div>
      </div>
    </header>
  );
}
