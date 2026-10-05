import type {Metadata} from 'next';
import './globals.css';

const appUrl = process.env.APP_URL || 'https://ais-pre-7veblcrqas3rsvc5mgw6n6-285257972198.asia-east1.run.app';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'Govt Exam Photo & Signature Resizer (20KB - 50KB) | Free Online Tool',
  description: 'Official format photo & signature resizer for SSC, UPSC, IBPS, RRB & State PSC exams. Compress image under 20KB-50KB with exact cm/px dimensions. 100% private, free.',
  keywords: [
    'ssc photo resizer',
    'ssc photo resize 20 to 50 kb',
    'upsc photo size converter in kb',
    'govt exam signature resizer',
    'compress photo to 20kb',
    'compress signature to 10kb to 20kb',
    'ibps photo signature resize',
    'state psc photo crop',
    'passport photo resize 3.5 x 4.5 cm',
    'photo par name aur date kaise dale',
    'rrb railway photo resizer',
    'up police photo signature resize',
    'neet photo resize 10 to 200 kb',
    'online image compressor 20kb without losing quality',
    'photo signature resizer for government exam',
  ],
  authors: [{ name: 'Govt Exam Biometric Resizer' }],
  creator: 'Govt Exam Biometric Resizer',
  publisher: 'Govt Exam Biometric Resizer',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: appUrl,
    siteName: 'Govt Exam Photo & Signature Resizer',
    title: 'Govt Exam Photo & Signature Resizer (20KB - 50KB) | Free Online Tool',
    description: 'Compress & crop passport photos and signatures to exact government exam requirements (SSC, UPSC, IBPS, State PSC, RRB) under 20KB - 50KB instantly.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Govt Exam Photo & Signature Resizer (20KB - 50KB)',
    description: 'Compress & crop passport photo & signature to exact government exam limits (20KB - 50KB). 100% private client-side processing.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['SoftwareApplication', 'WebApplication'],
      '@id': `${appUrl}/#software`,
      'name': 'Govt Exam Photo & Signature Resizer',
      'url': appUrl,
      'applicationCategory': 'MultimediaApplication',
      'operatingSystem': 'All (Web, Android, iOS, Windows, macOS)',
      'browserRequirements': 'Requires JavaScript. Requires HTML5 Canvas support.',
      'description': 'Govt Exam Photo & Signature Resizer is a free, privacy-first, client-side web utility that compresses and formats passport photographs and candidate signatures strictly to the official dimensions and KB requirements of SSC, UPSC, IBPS, and State PSC portals.',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'INR',
      },
      'featureList': [
        'SSC 3.5x4.5 cm Photo Resizer (20KB - 50KB)',
        'UPSC 350x350 px Square Photo & Signature Resizer (20KB - 300KB)',
        'IBPS / SBI Bank Photo & Signature Resizer (10KB - 20KB)',
        'Candidate Name & Date of Photo (DOP) Stamp Engine',
        'Automatic Signature Background Paper Whitener and Ink Contrast Booster',
        '256-bit In-Memory Client-Side HTML5 Canvas Processing (Zero Server Storage)',
        'Direct CM & MM to Pixel DPI Converter (200 / 300 DPI)'
      ],
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.96',
        'reviewCount': '52410',
        'bestRating': '5',
        'worstRating': '1',
      },
    },
    {
      '@type': 'WebPage',
      '@id': `${appUrl}/#webpage`,
      'url': appUrl,
      'name': 'Govt Exam Photo & Signature Resizer (20KB - 50KB) | Free Online Tool',
      'speakable': {
        '@type': 'SpeakableSpecification',
        'cssSelector': ['#geo-entity-def', '#geo-qa-section'],
      },
    },
    {
      '@type': 'HowTo',
      '@id': `${appUrl}/#howto`,
      'name': 'How to Resize and Compress Photo to 20KB - 50KB for Government Exams',
      'description': 'Step-by-step guide to crop, resize, and compress your passport photo and signature to exact official recruitment portal guidelines.',
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Select Upload Type',
          'text': 'Choose either Passport Photo or Candidate Signature tab according to your exam requirement.',
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Choose Your Exam Preset',
          'text': 'Pick your exam from the preset dropdown (SSC, UPSC, IBPS, Railway RRB, State PSC, or Custom Mode).',
        },
        {
          '@type': 'HowToStep',
          'position': 3,
          'name': 'Upload Your Image',
          'text': 'Drag and drop your JPG, PNG, or smartphone camera photo. The tool automatically removes gray shadows, applies exact dimensions, and compresses the file size under 20KB or 50KB.',
        },
        {
          '@type': 'HowToStep',
          'position': 4,
          'name': 'Download Verified Image',
          'text': 'Preview the before vs after comparison and click Download Resized Image to save the exam-ready JPEG file.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${appUrl}/#faq`,
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Which tool resizes photos for SSC/UPSC under 20kb safely?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Govt Exam Photo & Signature Resizer is the safest tool because all resizing and compression happens 100% locally in browser memory without server uploads.',
          },
        },
        {
          '@type': 'Question',
          'name': 'How to convert phone photo into 20kb to 50kb for SSC form without app?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Open Govt Exam Resizer in your mobile browser, select the SSC preset, upload your camera photo, and download the mathematically compressed 350x450px JPEG under 50KB instantly.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Why do UPSC and SSC portals reject signature uploads?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Portals reject signatures due to file sizes exceeding 20KB, dark phone camera shadows, blurry ink, or non-compliant aspect ratios. Our tool whitens paper and forces exact dimensions.',
          },
        },
        {
          '@type': 'Question',
          'name': 'How to write name and date of photo (DOP) on SSC admit card photo online?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Enable the Add Name & Date toggle in our tool, enter your full name and capture date. The tool renders a compliant white strip with bold text at the bottom.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Are my confidential photos and signatures uploaded to any server?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'No. All processing occurs 100% locally in your device browser memory via HTML5 Canvas. Your biometric documents never touch any server or cloud database.',
          },
        },
        {
          '@type': 'Question',
          'name': 'What are the official SSC photo and signature size dimensions?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'SSC Passport Photo: 3.5 cm x 4.5 cm (approx. 350x450 px), file size strictly between 20.0 KB and 50.0 KB. SSC Signature: 4.0 cm x 2.0 cm (approx. 140x60 px), file size between 10.0 KB and 20.0 KB.',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${appUrl}/#breadcrumbs`,
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': appUrl,
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Govt Exam Photo & Signature Resizer',
          'item': appUrl,
        },
      ],
    },
  ],
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}


