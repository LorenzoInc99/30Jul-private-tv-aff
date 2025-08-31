'use client';

export default function HeaderLogo() {
  const handleClick = () => {
    // Clear any stored tab state to ensure we go to scores
    if (typeof window !== 'undefined') {
      localStorage.removeItem('activeTab');
    }
  };

  return (
    <a 
      href="/" 
      className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight no-underline hover:text-blue-600 dark:hover:text-blue-400"
      onClick={handleClick}
    >
      Live Football on TV
    </a>
  );
}
