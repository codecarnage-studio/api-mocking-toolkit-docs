// @ts-check

const assetStoreUrl = 'https://assetstore.unity.com/packages/TODO-UPDATE-LINK';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'API Mocking Toolkit',
  tagline: 'Mock HTTP/REST backends, capture JSON, and replay sessions \\u2013 all inside Unity.',
  url: 'https://api-mocking-toolkit.codecarnage.com',
  baseUrl: '/',
  baseUrlIssueBanner: false,
	onBrokenLinks: 'throw',
  favicon: 'img/favicon.ico',

  organizationName: 'codecarnage-studio',
  projectName: 'api-mocking-toolkit',

	i18n: {
	  defaultLocale: 'en',
	  locales: ['en', 'fr'],
	  localeConfigs: {
	    en: { label: 'English', htmlLang: 'en' },
	    fr: { label: 'Français', htmlLang: 'fr' },
	  },
	},

	  customFields: {
	    assetStoreUrl,
	  },

	  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
	  ],

			markdown: {
			  hooks: {
			    onBrokenMarkdownLinks: 'warn',
			  },
			},

		plugins: [
		  [
		    '@docusaurus/plugin-google-gtag',
		    {
		      trackingID: 'G-7B6WKXNK7B',
		      anonymizeIP: true,
		    },
		  ],
		],

			themeConfig: {
	    navbar: {
		      title: 'API Mocking Toolkit',
		      logo: {
		        alt: 'Code Carnage',
		        src: 'img/codecarnage-logo.png',
		      },
	      items: [
        {
          type: 'doc',
          docId: 'quick-start',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/codecarnage-studio/api-mocking-toolkit-docs',
          label: 'GitHub',
          position: 'right',
        },
	        {
	          href: 'https://github.com/codecarnage-studio/api-mocking-toolkit-docs/issues',
	          label: 'Report an issue',
	          position: 'right',
	        },
	        {
	          href: assetStoreUrl,
	          label: 'Asset Store',
	          position: 'right',
	        },
	        {
	          type: 'localeDropdown',
	          position: 'right',
	        },
	      ],
	    },
	    // Limit per-page table of contents to top-level section headings (##)
	    // so the right-hand sidebar doesn't list every Step/sub-heading.
	    tableOfContents: {
	      minHeadingLevel: 2,
	      maxHeadingLevel: 2,
	    },
	  },
};

module.exports = config;
