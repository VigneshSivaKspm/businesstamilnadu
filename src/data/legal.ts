import { site } from '@/config/site';

/**
 * Legal page copy. This is a starting draft written for the current feature
 * set — have it reviewed by qualified counsel before launch.
 */

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface LegalDocument {
  title: string;
  description: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export type LegalDocKey = 'privacy' | 'terms' | 'disclaimer';

export const legalDocuments: Record<LegalDocKey, LegalDocument> = {
  privacy: {
    title: 'Privacy Policy',
    description: `How ${site.name} collects, uses and protects personal information.`,
    updated: '1 October 2026',
    intro: `This Privacy Policy explains how ${site.name} (“we”, “us”) handles information when you use ${site.domain}. We aim to collect only what we need to run a useful business directory.`,
    sections: [
      {
        heading: 'Information we collect',
        paragraphs: ['Depending on how you use the platform, we may collect:'],
        list: [
          'Business details you submit for a listing, such as business name, category, address, phone numbers, email, website, services and images.',
          'Contact details and messages you send through our contact form.',
          'Basic technical information such as browser type, device and pages visited, used to keep the site secure and improve it.',
        ],
      },
      {
        heading: 'How we use information',
        paragraphs: [
          'Business listing information is published on the platform so customers can find and contact the business. We use contact details to verify listings, respond to enquiries and provide support.',
          'We do not sell personal information. We do not publish the personal contact details of the person who submits a listing unless they are provided as the business’s public contact details.',
        ],
      },
      {
        heading: 'Information stored on your device',
        paragraphs: [
          'Some features store information locally in your browser — for example, saved businesses, registration drafts and form submissions made before online submission is enabled. This data stays on your device and can be removed by clearing your browser storage.',
        ],
      },
      {
        heading: 'Sharing',
        paragraphs: [
          'We may share information with service providers who help us operate the platform (such as hosting and email providers), only as needed for that purpose, or where required by law.',
        ],
      },
      {
        heading: 'Your choices',
        paragraphs: [
          `You can ask us to correct or remove a listing or personal information by writing to ${site.contact.email}. Business owners can request changes to their listing at any time.`,
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [`For privacy questions, contact ${site.contact.email}.`],
      },
    ],
  },
  terms: {
    title: 'Terms of Use',
    description: `The terms that apply when you use ${site.name}.`,
    updated: '1 October 2026',
    intro: `By accessing or using ${site.domain}, you agree to these Terms of Use. If you do not agree, please do not use the platform.`,
    sections: [
      {
        heading: 'The service',
        paragraphs: [
          `${site.name} is an online directory that helps people discover businesses, professionals and services in Tamil Nadu. We provide information to help you find and contact businesses; we are not a party to any transaction between you and a listed business.`,
        ],
      },
      {
        heading: 'Business listings',
        paragraphs: ['If you submit a listing, you confirm that:'],
        list: [
          'You are the owner of the business or are authorised to list it.',
          'The information you provide is accurate, lawful and kept up to date.',
          'You have the right to use any names, logos and images you submit.',
        ],
      },
      {
        heading: 'Verification and featured placement',
        paragraphs: [
          'A Verified badge means the submitted business information has been reviewed by our team. It is not a government certification, licence check or endorsement of service quality.',
          'Featured placement, where offered, is labelled on the platform. We may introduce paid plans in future; any such plans will have their own clearly stated terms.',
        ],
      },
      {
        heading: 'Acceptable use',
        paragraphs: ['You agree not to:'],
        list: [
          'Submit false, misleading or infringing content, or impersonate another business.',
          'Scrape, copy or republish directory data in bulk without written permission.',
          'Interfere with the security or operation of the platform.',
        ],
      },
      {
        heading: 'Moderation',
        paragraphs: [
          'We may edit, decline, suspend or remove any listing or content that we reasonably believe breaches these terms or is inaccurate.',
        ],
      },
      {
        heading: 'Liability',
        paragraphs: [
          'The platform is provided on an “as is” basis. To the extent permitted by law, we are not liable for losses arising from your dealings with listed businesses or from reliance on listing information.',
        ],
      },
      {
        heading: 'Governing law',
        paragraphs: ['These terms are governed by the laws of India. Courts in Tamil Nadu shall have jurisdiction.'],
      },
    ],
  },
  disclaimer: {
    title: 'Disclaimer',
    description: `Important information about listings on ${site.name}.`,
    updated: '1 October 2026',
    intro: `${site.name} is an independent business directory. Please read this disclaimer before relying on any listing.`,
    sections: [
      {
        heading: 'Listing information',
        paragraphs: [
          'Business information is provided by business owners or compiled from submissions. While our team reviews verified listings, we cannot guarantee that every detail is complete, current or accurate. Please confirm important details directly with the business.',
        ],
      },
      {
        heading: 'No government affiliation',
        paragraphs: [
          `${site.name} is not affiliated with, endorsed by or operated on behalf of the Government of Tamil Nadu or any government body. References to districts are geographic only.`,
        ],
      },
      {
        heading: 'Verified badges',
        paragraphs: [
          'Verification means submitted business information has been reviewed by the Business Tamil Nadu team. It is not a certification of licences, qualifications or service quality.',
        ],
      },
      {
        heading: 'Sample listings',
        paragraphs: [
          'While the platform is being launched, some listings may be fictional samples used to demonstrate features. These are labelled “Sample listing” and their contact details and ratings are placeholders.',
        ],
      },
      {
        heading: 'Third-party links',
        paragraphs: [
          'Listings may link to external websites, WhatsApp or map services. We are not responsible for the content or practices of third-party services.',
        ],
      },
    ],
  },
};
