import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Footer from '../components/Footer/Footer';
import logoMark from '../assets/raithamarga-new-mark.jpg';
import './Policies.css';

const policies = {
  en: {
    tagline: 'Connecting Farmers to Better Markets',
    welcome: 'Welcome to RaithaMarga. These policies explain the terms, responsibilities, payments, distance-based logistics and protections applicable to farmers and buyers using our platform.',
    agreement: 'By registering or using RaithaMarga, you agree to follow these policies.',
    updated: 'Last Updated: 13 November 2026',
    sections: [
      {
        title: 'Pricing Policy',
        intro: 'RaithaMarga aims to provide transparent and affordable services to farmers and buyers.',
        points: [
          'First 50 approved farmers: 0% farmer service fee for lifetime. This exemption applies only to the farmer’s service fee; buyers still pay a 2% service fee on eligible transactions.',
          'After the first 50 approved farmers: a 2% service fee applies to the farmer, while the buyer continues to pay a separate 2% service fee on eligible transactions.',
          'All applicable service fees will be displayed before the transaction is confirmed.',
          'No hidden platform service charges will be applied.',
          'Any applicable taxes will be disclosed separately.',
          'The lifetime fee benefit applies to the registered farmer account and is not transferable.',
          'RaithaMarga may update its pricing structure for future transactions with prior notice. Existing confirmed deals follow the fee terms displayed when they were accepted.',
        ],
      },
      {
        title: 'Payment Policy',
        intro: 'RaithaMarga aims to provide a secure and transparent payment experience.',
        points: [
          'Payments must be made only through payment methods officially enabled and displayed on the RaithaMarga platform.',
          'Never share your UPI PIN, OTP, passwords or banking credentials with anyone.',
          'Payments made outside the platform are not eligible for RaithaMarga payment tracking or transaction support.',
          'Where online payment processing is available, payments are handled through the designated payment service provider.',
          'Farmer payouts are initiated after delivery confirmation and applicable verification.',
          'Our target is to initiate eligible farmer payouts within 24 hours of delivery confirmation, subject to payment provider processing, bank operations and verification.',
          'Users will be informed of payment delays or verification requirements.',
        ],
        note: 'Online payment and payout services are available only after the official payment integration is activated.',
      },
      {
        title: 'Delivery & Distance-Based Logistics Policy',
        intro: 'RaithaMarga provides organized transportation and delivery of produce through verified logistics partners with a fair kilometer-based cost sharing structure.',
        points: [
          'RaithaMarga provides doorstep produce pickup and delivery through verified transport vehicles and logistics partners.',
          'Km-Based Shared Delivery Charges: Delivery charges are calculated transparently based on actual transit road distance (in kilometres / kms).',
          'Farmer Pickup Charge: Farmers pay the farm-gate collection and pickup charge calculated strictly on the distance (kms) from their farm to the regional loading hub.',
          'Buyer Delivery Charge: Buyers pay the destination transport charge calculated strictly on the distance (kms) from the hub to their store/warehouse location.',
          'Shared Logistics Cost: Dividing pickup and delivery costs by actual kilometers traveled ensures both parties pay only for the exact distance used, keeping transportation significantly more affordable than hiring standalone vehicles.',
          'Tamper-Proof Digital Weighment: All produce is weighed using certified digital scales at pickup and verified again upon arrival.',
          'Full Transit Protection: The RaithaMarga operations team actively monitors transit from dispatch to handover to ensure fresh, damage-free delivery.',
        ],
        note: 'Exact kilometer distances and the transparent pickup and delivery charges are computed and displayed prior to dispatch.',
      },
      {
        title: 'Team-Managed Communication & Intermediary Policy (Add-on Policy)',
        intro: 'To protect farmers from price depression and protect buyers from delivery failures, all trade communications and operational steps are handled 100% by the RaithaMarga Team.',
        points: [
          'Zero Direct Communication Rule: No direct phone calls, unmonitored messaging, or private deals between farmers and buyers are permitted or required.',
          '100% Handled by RaithaMarga Team: Order matching, asking price consensus, produce inspection, pickup scheduling, electronic weight slips, and delivery confirmations are coordinated end-to-end by the RaithaMarga Team.',
          'Central Support Desk: If a farmer or buyer has any questions, delivery updates, or grievances, they must contact the dedicated RaithaMarga Team directly via WhatsApp, Phone, or Help Center.',
          'Identity & Escrow Protection: Direct buyer-farmer contact is restricted to eliminate middlemen haggling, ensure certified weights, and protect escrow payout guarantees.',
        ],
      },
      {
        title: 'Refund and Cancellation Policy',
        intro: 'RaithaMarga aims to ensure fair handling of cancellations, damaged produce and quality-related complaints.',
        groups: [
          {
            title: 'Cancellation',
            points: [
              'Buyers may request cancellation before produce pickup or dispatch.',
              'Cancellation after pickup or dispatch may be subject to mutual agreement and the circumstances of the transaction.',
              'Any applicable refund is assessed based on the transaction status.',
            ],
          },
          {
            title: 'Damaged or Incorrect Produce',
            points: [
              'Buyers must report damaged, incorrect or materially different produce within 6 hours of delivery or handover.',
              'Buyers should provide clear photographs, transaction details and a description of the issue.',
              'RaithaMarga may request additional information from the farmer and buyer to verify the complaint.',
              'After verification, an appropriate resolution may include a full refund, partial refund, replacement or mutually agreed settlement, depending on the circumstances.',
            ],
          },
          {
            title: 'Refund Processing',
            points: [
              'Approved refunds are initiated through the original payment method wherever supported.',
              'Refund processing time depends on the payment provider and banking system.',
              'Refunds cannot be guaranteed for unverified complaints or circumstances outside the agreed transaction terms.',
            ],
          },
        ],
        note: 'RaithaMarga will review genuine complaints fairly and communicate the outcome to the concerned parties.',
      },
      {
        title: 'Privacy Policy',
        intro: 'RaithaMarga respects the privacy of farmers, buyers and other platform users.',
        groups: [
          {
            title: 'Information We Collect',
            points: [
              'Depending on the services used, we may collect your name and phone number; location and delivery-related information; farmer or buyer profile details; produce listings, photographs and transaction information; bank account details required for eligible farmer payouts; and technical information necessary for website security and operation.',
            ],
          },
          {
            title: 'How We Use Information',
            points: [
              'We use collected information to create and manage user accounts; connect farmers with interested buyers; facilitate orders, bids and transactions; process payments and eligible payouts; provide customer support and resolve disputes; and maintain platform security and prevent misuse.',
            ],
          },
          {
            title: 'Information Sharing',
            points: [
              'We do not sell users’ personal information.',
              'Personal information is shared only when necessary to operate the platform, process transactions, provide services or comply with applicable law.',
              'Full phone numbers and sensitive personal information are not publicly displayed.',
              'Payment credentials such as UPI PINs and OTPs must never be collected or stored by RaithaMarga.',
            ],
          },
          {
            title: 'Data Protection',
            points: [
              'We take reasonable measures to protect user information against unauthorized access, misuse or disclosure.',
              'Users may contact RaithaMarga to request access, correction or deletion of their personal information, subject to applicable legal and transaction-record retention requirements.',
            ],
          },
        ],
      },
      {
        title: 'Platform Use Policy',
        intro: 'RaithaMarga is intended to provide a trusted marketplace for farmers and buyers.',
        points: [
          'All users agree to provide accurate registration and transaction information.',
          'Farmers must publish genuine produce listings with correct quantity, price and quality details.',
          'Users must avoid fake bids, fraudulent listings and misleading information.',
          'Users must treat other platform users respectfully and avoid misuse of personal information obtained through the platform.',
          'Users must follow agreed transaction terms and payment procedures.',
        ],
        groups: [
          {
            title: 'Fair Platform Usage',
            points: [
              'Users must not misuse RaithaMarga to obtain another user’s contact information for fraudulent purposes or deliberately bypass applicable platform service fees.',
              'Transactions arranged through RaithaMarga should follow the platform’s applicable transaction and payment procedures.',
              'Transactions independently arranged outside RaithaMarga are not covered by its platform payment tracking, verification or dispute-support services.',
              'RaithaMarga may investigate reported misuse and restrict accounts or suspend access where there is evidence of fraudulent or prohibited activity, subject to applicable law.',
            ],
          },
        ],
        note: 'RaithaMarga aims to maintain a transparent and trustworthy marketplace for everyone.',
      },
    ],
    contactTitle: 'Contact and Support',
    contactIntro: 'For questions, complaints, delivery scheduling or policy-related concerns, reach out to the RaithaMarga Team directly:',
    contact: [
      ['Platform', 'RaithaMarga'],
      ['Website', 'https://raitha-marga.vercel.app'],
      ['Support Helpline / WhatsApp', '+91 94800 00000 / Available 7 AM - 9 PM'],
      ['Operations & Grievance Desk', 'support@raithamarga.in'],
      ['Address', 'RaithaMarga Farmer Support Center, Karnataka, India'],
    ],
    closing: 'RaithaMarga reserves the right to update these policies when required. Updated policies will be published on this page.',
  },
  kn: {
    tagline: 'ರೈತರನ್ನು ಉತ್ತಮ ಮಾರುಕಟ್ಟೆಗಳಿಗೆ ಸಂಪರ್ಕಿಸುವುದು',
    welcome: 'ರೈತಮಾರ್ಗಕ್ಕೆ ಸ್ವಾಗತ. ನಮ್ಮ ವೇದಿಕೆಯನ್ನು ಬಳಸುವ ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರಿಗೆ ಅನ್ವಯಿಸುವ ನಿಯಮಗಳು, ಜವಾಬ್ದಾರಿಗಳು, ಪಾವತಿಗಳು, ಕಿ.ಮೀ. ಆಧಾರಿತ ಸಾರಿಗೆ ಮತ್ತು ರಕ್ಷಣೆಗಳನ್ನು ಈ ನೀತಿಗಳು ವಿವರಿಸುತ್ತವೆ.',
    agreement: 'ರೈತಮಾರ್ಗದಲ್ಲಿ ನೋಂದಾಯಿಸುವ ಮೂಲಕ ಅಥವಾ ಬಳಸುವ ಮೂಲಕ, ಈ ನೀತಿಗಳನ್ನು ಪಾಲಿಸಲು ನೀವು ಒಪ್ಪುತ್ತೀರಿ.',
    updated: 'ಕೊನೆಯ ನವೀಕರಣ: 13 ನವೆಂಬರ್ 2026',
    sections: [
      {
        title: 'ಬೆಲೆ ನೀತಿ',
        intro: 'ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರಿಗೆ ಪಾರದರ್ಶಕ ಹಾಗೂ ಕೈಗೆಟುಕುವ ಸೇವೆಗಳನ್ನು ಒದಗಿಸುವುದು ರೈತಮಾರ್ಗದ ಉದ್ದೇಶ.',
        points: [
          'ಮೊದಲ 50 ಅನುಮೋದಿತ ರೈತರಿಗೆ ಜೀವನಪೂರ್ತಿ ರೈತರ ಸೇವಾ ಶುಲ್ಕ 0%. ಈ ವಿನಾಯಿತಿ ರೈತರ ಸೇವಾ ಶುಲ್ಕಕ್ಕೆ ಮಾತ್ರ; ಅರ್ಹ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಖರೀದಿದಾರರು 2% ಸೇವಾ ಶುಲ್ಕ ಪಾವತಿಸಬೇಕು.',
          'ಮೊದಲ 50 ಅನುಮೋದಿತ ರೈತರ ನಂತರ, ರೈತರಿಗೆ 2% ಸೇವಾ ಶುಲ್ಕ ಅನ್ವಯಿಸುತ್ತದೆ; ಖರೀದಿದಾರರು ಅರ್ಹ ವ್ಯವಹಾರಗಳಲ್ಲಿ ಪ್ರತ್ಯೇಕ 2% ಸೇವಾ ಶುಲ್ಕವನ್ನು ಪಾವತಿಸುತ್ತಾರೆ.',
          'ವ್ಯವಹಾರ ದೃಢೀಕರಿಸುವ ಮೊದಲು ಅನ್ವಯಿಸುವ ಎಲ್ಲಾ ಸೇವಾ ಶುಲ್ಕಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತದೆ.',
          'ಯಾವುದೇ ಗುಪ್ತ ವೇದಿಕೆ ಸೇವಾ ಶುಲ್ಕ ವಿಧಿಸಲಾಗುವುದಿಲ್ಲ.',
          'ಅನ್ವಯಿಸುವ ತೆರಿಗೆಗಳನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ತಿಳಿಸಲಾಗುತ್ತದೆ.',
          'ಜೀವನಪೂರ್ತಿ ಶುಲ್ಕ ವಿನಾಯಿತಿ ನೋಂದಾಯಿತ ರೈತ ಖಾತೆಗೆ ಅನ್ವಯಿಸುತ್ತದೆ ಮತ್ತು ವರ್ಗಾಯಿಸಲಾಗುವುದಿಲ್ಲ.',
          'ಭವಿಷ್ಯದ ವ್ಯವಹಾರಗಳಿಗೆ ಮುಂಚಿತ ಸೂಚನೆಯೊಂದಿಗೆ ಬೆಲೆ ರಚನೆಯನ್ನು ರೈತಮಾರ್ಗ ನವೀಕರಿಸಬಹುದು. ಈಗಾಗಲೇ ದೃಢೀಕರಿಸಿದ ಒಪ್ಪಂದಗಳಿಗೆ ಅವುಗಳನ್ನು ಒಪ್ಪಿದಾಗ ತೋರಿಸಿದ ಶುಲ್ಕ ನಿಯಮಗಳು ಅನ್ವಯಿಸುತ್ತವೆ.',
        ],
      },
      {
        title: 'ಪಾವತಿ ನೀತಿ',
        intro: 'ಸುರಕ್ಷಿತ ಮತ್ತು ಪಾರದರ್ಶಕ ಪಾವತಿ ಅನುಭವ ಒದಗಿಸುವುದು ರೈತಮಾರ್ಗದ ಉದ್ದೇಶ.',
        points: [
          'ರೈತಮಾರ್ಗ ವೇದಿಕೆಯಲ್ಲಿ ಅಧಿಕೃತವಾಗಿ ಸಕ್ರಿಯಗೊಳಿಸಿ ತೋರಿಸಿರುವ ಪಾವತಿ ವಿಧಾನಗಳ ಮೂಲಕ ಮಾತ್ರ ಪಾವತಿಸಬೇಕು.',
          'ನಿಮ್ಮ UPI PIN, OTP, ಪಾಸ್‌ವರ್ಡ್ ಅಥವಾ ಬ್ಯಾಂಕಿಂಗ್ ರುಜುವಾತುಗಳನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.',
          'ವೇದಿಕೆಯ ಹೊರಗಿನ ಪಾವತಿಗಳಿಗೆ ರೈತಮಾರ್ಗದ ಪಾವತಿ ಟ್ರ್ಯಾಕಿಂಗ್ ಅಥವಾ ವ್ಯವಹಾರ ಬೆಂಬಲ ಅನ್ವಯಿಸುವುದಿಲ್ಲ.',
          'ಆನ್‌ಲೈನ್ ಪಾವತಿ ಲಭ್ಯವಿದ್ದಲ್ಲಿ, ಗೊತ್ತುಪಡಿಸಿದ ಪಾವತಿ ಸೇವಾ ಪೂರೈಕೆದಾರರ ಮೂಲಕ ಪಾವತಿಯನ್ನು ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ.',
          'ವಿತರಣೆ ದೃಢೀಕರಣ ಮತ್ತು ಅನ್ವಯಿಸುವ ಪರಿಶೀಲನೆಯ ನಂತರ ರೈತರಿಗೆ ಪಾವತಿ ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತದೆ.',
          'ಪಾವತಿ ಪೂರೈಕೆದಾರರ ಪ್ರಕ್ರಿಯೆ, ಬ್ಯಾಂಕ್ ಕಾರ್ಯಾಚರಣೆ ಮತ್ತು ಪರಿಶೀಲನೆಗೆ ಒಳಪಟ್ಟು, ವಿತರಣೆ ದೃಢೀಕರಣದ 24 ಗಂಟೆಗಳೊಳಗೆ ಅರ್ಹ ರೈತರ ಪಾವತಿಯನ್ನು ಪ್ರಾರಂಭಿಸುವುದು ನಮ್ಮ ಗುರಿ.',
          'ಪಾವತಿ ವಿಳಂಬ ಅಥವಾ ಹೆಚ್ಚುವರಿ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದ್ದರೆ ಬಳಕೆದಾರರಿಗೆ ತಿಳಿಸಲಾಗುತ್ತದೆ.',
        ],
        note: 'ಅಧಿಕೃತ ಪಾವತಿ ಏಕೀಕರಣ ಸಕ್ರಿಯಗೊಂಡ ನಂತರ ಮಾತ್ರ ಆನ್‌ಲೈನ್ ಪಾವತಿ ಮತ್ತು ರೈತರಿಗೆ ಪಾವತಿ ಸೇವೆಗಳು ಲಭ್ಯವಿರುತ್ತವೆ.',
      },
      {
        title: 'ವಿತರಣೆ ಮತ್ತು ಕಿಲೋಮೀಟರ್ ಆಧಾರಿತ ಸಾರಿಗೆ ನೀತಿ',
        intro: 'ರೈತಮಾರ್ಗವು ಪರಿಶೀಲಿಸಿದ ಸಾರಿಗೆ ವಾಹನಗಳ ಮೂಲಕ ನೇರ ಉತ್ಪನ್ನ ಪಿಕಪ್ ಮತ್ತು ವಿತರಣಾ ಸೇವೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ; ಸಾರಿಗೆ ಶುಲ್ಕವನ್ನು ಕಿ.ಮೀ. ಆಧಾರದ ಮೇಲೆ ನ್ಯಾಯಯುತವಾಗಿ ಹಂಚಲಾಗುತ್ತದೆ.',
        points: [
          'ರೈತಮಾರ್ಗವು ಪ್ರತಿಯೊಂದು ಖಚಿತ ಒಪ್ಪಂದಕ್ಕೆ ಮನೆಬಾಗಿಲಿನ ಪಿಕಪ್ ಮತ್ತು ಗಮ್ಯಸ್ಥಾನ ವಿತರಣಾ ಸೇವೆಯನ್ನು ಒದಗಿಸುತ್ತದೆ.',
          'ಕಿಲೋಮೀಟರ್ (Kms) ಆಧಾರಿತ ಶುಲ್ಕ ವಿಭಜನೆ: ಸಾರಿಗೆ ಮತ್ತು ವಿತರಣಾ ಶುಲ್ಕವನ್ನು ನಿಜವಾದ ರಸ್ತೆ ದೂರ (ಕಿ.ಮೀ.) ಆಧಾರದ ಮೇಲೆ ಪಾರದರ್ಶಕವಾಗಿ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ.',
          'ರೈತರ ಪಿಕಪ್ ಶುಲ್ಕ: ರೈತರು ತಮ್ಮ ಹೊಲ/ಗ್ರಾಮದಿಂದ ಸ್ಥಳೀಯ ಕ್ಲಸ್ಟರ್ ಹಬ್‌ಗೆ ತಲುಪಲು ಆಗುವ ಕಿಲೋಮೀಟರ್ ಆಧಾರದಲ್ಲಿ ಮಾತ್ರ ಪಿಕಪ್ ಶುಲ್ಕ ಪಾವತಿಸುತ್ತಾರೆ.',
          'ಖರೀದಿದಾರರ ವಿತರಣಾ ಶುಲ್ಕ: ಖರೀದಿದಾರರು ಹಬ್‌ನಿಂದ ತಮ್ಮ ಅಂಗಡಿ/ಗೋದಾಮಿಗೆ ತಲುಪಲು ಆಗುವ ಕಿಲೋಮೀಟರ್ ಆಧಾರದಲ್ಲಿ ಸಾರಿಗೆ ಶುಲ್ಕ ಪಾವತಿಸುತ್ತಾರೆ.',
          'ಇಬ್ಬರಿಗೂ ಕಡಿಮೆ ವೆಚ್ಚ: ಸಾರಿಗೆ ವೆಚ್ಚವನ್ನು ದೂರದ (ಕಿ.ಮೀ.) ಪ್ರಕಾರ ಇಬ್ಬರೂ ಹಂಚಿಕೊಳ್ಳುವುದರಿಂದ, ಪ್ರತ್ಯೇಕ ವಾಹನ ಬಾಡಿಗೆಗಿಂತ ಸಾಗಾಣಿಕೆ ವೆಚ್ಚ ಗಣನೀಯವಾಗಿ ಕಡಿಮೆಯಾಗುತ್ತದೆ.',
          'ಡಿಜಿಟಲ್ ತೂಕ ಖಾತರಿ: ಪಿಕಪ್ ಸಮಯದಲ್ಲಿ ಮತ್ತು ತಲುಪಿದ ಸ್ಥಳದಲ್ಲಿ ಡಿಜಿಟಲ್ ತೂಕದ ಸ್ಲಿಪ್‌ನೊಂದಿಗೆ ಕರಾರುವಾಕ್ ತೂಕವನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.',
          'ಲೈವ್ ಟ್ರಾನ್ಸಿಟ್ ಮಾನಿಟರಿಂಗ್: ರೈತಮಾರ್ಗದ ಆಪರೇಷನ್ಸ್ ತಂಡವೇ ವಾಹನದ ಪ್ರಯಾಣವನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ ಸುರಕ್ಷಿತ ವಿತರಣೆ ಖಚಿತಪಡಿಸುತ್ತದೆ.',
        ],
        note: 'ಉತ್ಪನ್ನ ರವಾನೆಗೂ ಮುನ್ನ ನಿಖರ ಕಿಲೋಮೀಟರ್ ಮತ್ತು ಪಿಕಪ್-ವಿತರಣಾ ಶುಲ್ಕವನ್ನು ಪರದೆಯ ಮೇಲೆ ಸ್ಪಷ್ಟವಾಗಿ ತೋರಿಸಲಾಗುತ್ತದೆ.',
      },
      {
        title: 'ತಂಡದ ಸಂಪೂರ್ಣ ನಿರ್ವಹಣೆ & ಶೂನ್ಯ ನೇರ ಸಂವಹನ ನೀತಿ (ಆಡ್-ಆನ್ ನೀತಿ)',
        intro: 'ಮಧ್ಯವರ್ತಿಗಳ ಹಾವಳಿ ತಪ್ಪಿಸಲು, ನಿಖರ ತೂಕ ಮತ್ತು ನ್ಯಾಯಯುತ ಪಾವತಿ ಖಾತರಿಪಡಿಸಲು ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರ ನಡುವಿನ ಸಂಪೂರ್ಣ ವ್ಯವಹಾರವನ್ನು ರೈತಮಾರ್ಗ ತಂಡವೇ ನಿರ್ವಹಿಸುತ್ತದೆ.',
        points: [
          'ಶೂನ್ಯ ನೇರ ಸಂವಹನ ನಿಯಮ: ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರ ನಡುವೆ ನೇರ ಫೋನ್ ಕರೆಗಳು ಅಥವಾ ಖಾಸಗಿ ಮಾತುಕತೆಗಳ ಅಗತ್ಯವಿಲ್ಲ ಮತ್ತು ಅನುಮತಿಸಲಾಗುವುದಿಲ್ಲ.',
          'ರೈತಮಾರ್ಗ ತಂಡದಿಂದ 100% ನಿರ್ವಹಣೆ: ಬೆಳೆ ಹೊಂದಾಣಿಕೆ, ಬೆಲೆ ದೃಢೀಕರಣ, ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ, ಡಿಜಿಟಲ್ ತೂಕ, ಪಿಕಪ್ ಸಮಯ ಮತ್ತು ವಿತರಣೆ ಎಲ್ಲವನ್ನೂ ರೈತಮಾರ್ಗದ ಅಧಿಕೃತ ತಂಡವೇ ನಿರ್ವಹಿಸುತ್ತದೆ.',
          'ಕೇಂದ್ರ ಸಹಾಯವಾಣಿ: ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳು, ಸಮಯ ಬದಲಾವಣೆ ಅಥವಾ ಸಮಸ್ಯೆಗಳಿದ್ದಲ್ಲಿ ರೈತರು ಹಾಗೂ ಖರೀದಿದಾರರು ನೇರವಾಗಿ ರೈತಮಾರ್ಗ ತಂಡವನ್ನು (ವಾಟ್ಸಾಪ್ / ಫೋನ್) ಸಂಪರ್ಕಿಸಬೇಕು.',
          'ಗೌಪ್ಯತೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಎಸ್ಕ್ರೋ: ಇಬ್ಬರ ವೈಯಕ್ತಿಕ ಫೋನ್ ನಂಬರ್ ಅಥವಾ ಹಣಕಾಸಿನ ಮಾಹಿತಿಯನ್ನು ಪರಸ್ಪರ ಬಹಿರಂಗಪಡಿಸದೆ, ಮೋಸ ಹೋಗುವುದನ್ನು ತಡೆದು ನಿಖರ ಪಾವತಿ ಖಾತರಿ ನೀಡಲಾಗುತ್ತದೆ.',
        ],
      },
      {
        title: 'ಮರುಪಾವತಿ ಮತ್ತು ರದ್ದತಿ ನೀತಿ',
        intro: 'ರದ್ದತಿ, ಹಾನಿಗೊಂಡ ಉತ್ಪನ್ನ ಮತ್ತು ಗುಣಮಟ್ಟದ ದೂರುಗಳನ್ನು ನ್ಯಾಯಯುತವಾಗಿ ನಿರ್ವಹಿಸುವುದು ರೈತಮಾರ್ಗದ ಉದ್ದೇಶ.',
        groups: [
          {
            title: 'ರದ್ದತಿ',
            points: [
              'ಉತ್ಪನ್ನ ಪಿಕಪ್ ಅಥವಾ ರವಾನೆಗೆ ಮೊದಲು ಖರೀದಿದಾರರು ರದ್ದತಿಗೆ ವಿನಂತಿಸಬಹುದು.',
              'ಪಿಕಪ್ ಅಥವಾ ರವಾನೆಯ ನಂತರದ ರದ್ದತಿ ಪರಸ್ಪರ ಒಪ್ಪಿಗೆ ಮತ್ತು ವ್ಯವಹಾರದ ಸಂದರ್ಭಗಳಿಗೆ ಒಳಪಟ್ಟಿರಬಹುದು.',
              'ಯಾವುದೇ ಮರುಪಾವತಿಯನ್ನು ವ್ಯವಹಾರದ ಸ್ಥಿತಿಯನ್ನು ಆಧರಿಸಿ ನಿರ್ಧರಿಸಲಾಗುತ್ತದೆ.',
            ],
          },
          {
            title: 'ಹಾನಿಗೊಂಡ ಅಥವಾ ತಪ್ಪಾದ ಉತ್ಪನ್ನ',
            points: [
              'ಹಾನಿಗೊಂಡ, ತಪ್ಪಾದ ಅಥವಾ ಒಪ್ಪಿದ ಗುಣಮಟ್ಟಕ್ಕಿಂತ ಗಣನೀಯವಾಗಿ ಭಿನ್ನವಾದ ಉತ್ಪನ್ನವನ್ನು ವಿತರಣೆ ಅಥವಾ ಹಸ್ತಾಂತರದ 6 ಗಂಟೆಗಳೊಳಗೆ ವರದಿ ಮಾಡಬೇಕು.',
              'ಸ್ಪಷ್ಟ ಛಾಯಾಚಿತ್ರಗಳು, ವ್ಯವಹಾರದ ವಿವರಗಳು ಮತ್ತು ಸಮಸ್ಯೆಯ ವಿವರಣೆಯನ್ನು ಒದಗಿಸಬೇಕು.',
              'ದೂರನ್ನು ಪರಿಶೀಲಿಸಲು ರೈತಮಾರ್ಗವು ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರಿಂದ ಹೆಚ್ಚುವರಿ ಮಾಹಿತಿಯನ್ನು ಕೇಳಬಹುದು.',
              'ಪರಿಶೀಲನೆಯ ನಂತರ, ಸಂದರ್ಭಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಪೂರ್ಣ ಮರುಪಾವತಿ, ಭಾಗಶಃ ಮರುಪಾವತಿ, ಬದಲಿ ಉತ್ಪನ್ನ ಅಥವಾ ಪರಸ್ಪರ ಒಪ್ಪಿದ ಪರಿಹಾರ ನೀಡಬಹುದು.',
            ],
          },
          {
            title: 'ಮರುಪಾವತಿ ಪ್ರಕ್ರಿಯೆ',
            points: [
              'ಬೆಂಬಲಿತವಾಗಿದ್ದಲ್ಲಿ, ಅನುಮೋದಿತ ಮರುಪಾವತಿಯನ್ನು ಮೂಲ ಪಾವತಿ ವಿಧಾನದ ಮೂಲಕ ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತದೆ.',
              'ಮರುಪಾವತಿ ಸಮಯವು ಪಾವತಿ ಪೂರೈಕೆದಾರ ಮತ್ತು ಬ್ಯಾಂಕಿಂಗ್ ವ್ಯವಸ್ಥೆಯನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ.',
              'ಪರಿಶೀಲಿಸದ ದೂರುಗಳು ಅಥವಾ ಒಪ್ಪಿದ ವ್ಯವಹಾರ ನಿಯಮಗಳ ಹೊರಗಿನ ಸಂದರ್ಭಗಳಿಗೆ ಮರುಪಾವತಿ ಖಾತರಿ ಇಲ್ಲ.',
            ],
          },
        ],
        note: 'ನಿಜವಾದ ದೂರುಗಳನ್ನು ರೈತಮಾರ್ಗ ನ್ಯಾಯಯುತವಾಗಿ ಪರಿಶೀಲಿಸಿ, ಸಂಬಂಧಿಸಿದ ಪಕ್ಷಗಳಿಗೆ ಫಲಿತಾಂಶ ತಿಳಿಸುತ್ತದೆ.',
      },
      {
        title: 'ಗೌಪ್ಯತಾ ನೀತಿ',
        intro: 'ರೈತರು, ಖರೀದಿದಾರರು ಮತ್ತು ಇತರ ವೇದಿಕೆ ಬಳಕೆದಾರರ ಗೌಪ್ಯತೆಯನ್ನು ರೈತಮಾರ್ಗ ಗೌರವಿಸುತ್ತದೆ.',
        groups: [
          {
            title: 'ನಾವು ಸಂಗ್ರಹಿಸುವ ಮಾಹಿತಿ',
            points: [
              'ಬಳಸುವ ಸೇವೆಗಳ ಆಧಾರದ ಮೇಲೆ, ಹೆಸರು ಮತ್ತು ಫೋನ್ ಸಂಖ್ಯೆ; ಸ್ಥಳ ಮತ್ತು ವಿತರಣೆಗೆ ಸಂಬಂಧಿಸಿದ ಮಾಹಿತಿ; ರೈತ ಅಥವಾ ಖರೀದಿದಾರರ ಪ್ರೊಫೈಲ್ ವಿವರಗಳು; ಉತ್ಪನ್ನ ಪಟ್ಟಿಗಳು, ಛಾಯಾಚಿತ್ರಗಳು ಮತ್ತು ವ್ಯವಹಾರ ಮಾಹಿತಿ; ಅರ್ಹ ರೈತ ಪಾವತಿಗೆ ಅಗತ್ಯವಿರುವ ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರಗಳು; ಹಾಗೂ ವೆಬ್‌ಸೈಟ್ ಸುರಕ್ಷತೆ ಮತ್ತು ಕಾರ್ಯಾಚರಣೆಗೆ ಅಗತ್ಯವಾದ ತಾಂಾಂತ್ರಿಕ ಮಾಹಿತಿಯನ್ನು ಸಂಗ್ರಹಿಸಬಹುದು.',
            ],
          },
          {
            title: 'ಮಾಹಿತಿಯನ್ನು ನಾವು ಹೇಗೆ ಬಳಸುತ್ತೇವೆ',
            points: [
              'ಬಳಕೆದಾರರ ಖಾತೆಗಳನ್ನು ರಚಿಸಲು ಮತ್ತು ನಿರ್ವಹಿಸಲು; ಆಸಕ್ತ ಖರೀದಿದಾರರೊಂದಿಗೆ ರೈತರನ್ನು ಸಂಪರ್ಕಿಸಲು; ಆರ್ಡರ್, ಬಿಡ್ ಮತ್ತು ವ್ಯವಹಾರಗಳನ್ನು ಸುಗಮಗೊಳಿಸಲು; ಪಾವತಿ ಮತ್ತು ಅರ್ಹ ಪಾವತಿಗಳನ್ನು ನಿರ್ವಹಿಸಲು; ಗ್ರಾಹಕ ಬೆಂಬಲ ಮತ್ತು ವಿವಾದ ಪರಿಹಾರಕ್ಕೆ; ಹಾಗೂ ವೇದಿಕೆ ಸುರಕ್ಷತೆ ಕಾಪಾಡಿ ದುರುಪಯೋಗ ತಡೆಯಲು ಸಂಗ್ರಹಿಸಿದ ಮಾಹಿತಿಯನ್ನು ಬಳಸುತ್ತೇವೆ.',
            ],
          },
          {
            title: 'ಮಾಹಿತಿ ಹಂಚಿಕೆ',
            points: [
              'ಬಳಕೆದಾರರ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ನಾವು ಮಾರಾಟ ಮಾಡುವುದಿಲ್ಲ.',
              'ವೇದಿಕೆ ನಿರ್ವಹಣೆ, ವ್ಯವಹಾರ ಪ್ರಕ್ರಿಯೆ, ಸೇವೆ ಒದಗಿಸುವಿಕೆ ಅಥವಾ ಅನ್ವಯಿಸುವ ಕಾನೂನು ಪಾಲನೆಗೆ ಅಗತ್ಯವಿದ್ದಾಗ ಮಾತ್ರ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ಹಂಚಲಾಗುತ್ತದೆ.',
              'ಪೂರ್ಣ ಫೋನ್ ಸಂಖ್ಯೆಗಳು ಮತ್ತು ಸೂಕ್ಷ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ಸಾರ್ವಜನಿಕವಾಗಿ ತೋರಿಸುವುದಿಲ್ಲ.',
              'UPI PIN ಮತ್ತು OTP ಮುಂತಾದ ಪಾವತಿ ರುಜುವಾತುಗಳನ್ನು ರೈತಮಾರ್ಗ ಎಂದಿಗೂ ಸಂಗ್ರಹಿಸುವುದಿಲ್ಲ.',
            ],
          },
          {
            title: 'ಡೇಟಾ ರಕ್ಷಣೆ',
            points: [
              'ಅನಧಿಕೃತ ಪ್ರವೇಶ, ದುರುಪಯೋಗ ಅಥವಾ ಬಹಿರಂಗಪಡಿಸುವಿಕೆಯಿಂದ ಬಳಕೆದಾರರ ಮಾಹಿತಿಯನ್ನು ರಕ್ಷಿಸಲು ನಾವು ಸೂಕ್ತ ಕ್ರಮಗಳನ್ನು ಕೈಗೊಳ್ಳುತ್ತೇವೆ.',
              'ಅನ್ವಯಿಸುವ ಕಾನೂನು ಮತ್ತು ವ್ಯವಹಾರ ದಾಖಲೆ ಉಳಿಸುವ ಅಗತ್ಯಗಳಿಗೆ ಒಳಪಟ್ಟು, ಬಳಕೆದಾರರು ತಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ನೋಡಲು, ತಿದ್ದುಪಡಿ ಮಾಡಲು ಅಥವಾ ಅಳಿಸಲು ರೈತಮಾರ್ಗವನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು.',
            ],
          },
        ],
      },
      {
        title: 'ವೇದಿಕೆ ಬಳಕೆ ನೀತಿ',
        intro: 'ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರಿಗೆ ವಿಶ್ವಾಸಾರ್ಹ ಮಾರುಕಟ್ಟೆ ಒದಗಿಸುವುದು ರೈತಮಾರ್ಗದ ಉದ್ದೇಶ.',
        points: [
          'ಎಲ್ಲ ಬಳಕೆದಾರರು ನಿಖರವಾದ ನೋಂದಣಿ ಮತ್ತು ವ್ಯವಹಾರ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಬೇಕು.',
          'ರೈತರು ಸರಿಯಾದ ಪ್ರಮಾಣ, ಬೆಲೆ ಮತ್ತು ಗುಣಮಟ್ಟದ ವಿವರಗಳೊಂದಿಗೆ ನೈಜ ಉತ್ಪನ್ನ ಪಟ್ಟಿಗಳನ್ನು ಪ್ರಕಟಿಸಬೇಕು.',
          'ನಕಲಿ ಬಿಡ್‌ಗಳು, ಮೋಸದ ಪಟ್ಟಿಗಳು ಮತ್ತು ತಪ್ಪು ಮಾಹಿತಿಯನ್ನು ತಪ್ಪಿಸಬೇಕು.',
          'ಇತರ ವೇದಿಕೆ ಬಳಕೆದಾರರನ್ನು ಗೌರವದಿಂದ ನಡೆಸಿಕೊಳ್ಳಬೇಕು ಮತ್ತು ವೇದಿಕೆಯಿಂದ ಪಡೆದ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ದುರುಪಯೋಗಪಡಿಸಬಾರದು.',
          'ಒಪ್ಪಿದ ವ್ಯವಹಾರ ನಿಯಮಗಳು ಮತ್ತು ಪಾವತಿ ವಿಧಾನಗಳನ್ನು ಪಾಲಿಸಬೇಕು.',
        ],
        groups: [
          {
            title: 'ನ್ಯಾಯಯುತ ವೇದಿಕೆ ಬಳಕೆ',
            points: [
              'ಮೋಸದ ಉದ್ದೇಶಕ್ಕಾಗಿ ಇತರ ಬಳಕೆದಾರರ ಸಂಪರ್ಕ ಮಾಹಿತಿ ಪಡೆಯಲು ಅಥವಾ ಅನ್ವಯಿಸುವ ವೇದಿಕೆ ಸೇವಾ ಶುಲ್ಕವನ್ನು ಉದ್ದೇಶಪೂರ್ವಕವಾಗಿ ತಪ್ಪಿಸಲು ರೈತಮಾರ್ಗವನ್ನು ದುರುಪಯೋಗಪಡಿಸಬಾರದು.',
              'ರೈತಮಾರ್ಗದ ಮೂಲಕ ಏರ್ಪಡಿಸಿದ ವ್ಯವಹಾರಗಳು ಅನ್ವಯಿಸುವ ವೇದಿಕೆ ವ್ಯವಹಾರ ಮತ್ತು ಪಾವತಿ ವಿಧಾನಗಳನ್ನು ಅನುಸರಿಸಬೇಕು.',
              'ರೈತಮಾರ್ಗದ ಹೊರಗೆ ಸ್ವತಂತ್ರವಾಗಿ ಏರ್ಪಡಿಸಿದ ವ್ಯವಹಾರಗಳಿಗೆ ವೇದಿಕೆಯ ಪಾವತಿ ಟ್ರ್ಯಾಕಿಂಗ್, ಪರಿಶೀಲನೆ ಅಥವಾ ವಿವಾದ ಬೆಂಬಲ ಅನ್ವಯಿಸುವುದಿಲ್ಲ.',
              'ಮೋಸದ ಅಥವಾ ನಿಷೇಧಿತ ಚಟುವಟಿಕೆಯ ಸಾಕ್ಷ್ಯವಿದ್ದಲ್ಲಿ, ಅನ್ವಯಿಸುವ ಕಾನೂನಿಗೆ ಒಳಪಟ್ಟು, ರೈತಮಾರ್ಗವು ದುರುಪಯೋಗವನ್ನು ತನಿಖೆ ಮಾಡಿ ಖಾತೆಗಳನ್ನು ನಿರ್ಬಂಧಿಸಬಹುದು ಅಥವಾ ಪ್ರವೇಶವನ್ನು ಸ್ಥಗಿತಗೊಳಿಸಬಹುದು.',
            ],
          },
        ],
        note: 'ಎಲ್ಲರಿಗೂ ಪಾರದರ್ಶಕ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಮಾರುಕಟ್ಟೆಯನ್ನು ಕಾಪಾಡಲು ರೈತಮಾರ್ಗ ಬದ್ಧವಾಗಿದೆ.',
      },
    ],
    contactTitle: 'ಸಂಪರ್ಕ ಮತ್ತು ಬೆಂಬಲ',
    contactIntro: 'ಪ್ರಶ್ನೆಗಳು, ದೂರುಗಳು, ಸಾರಿಗೆ ವೇಳಾಪಟ್ಟಿ ಅಥವಾ ನೀತಿ ಸಂಬಂಧಿತ ವಿಚಾರಗಳಿಗಾಗಿ ರೈತಮಾರ್ಗ ತಂಡವನ್ನು ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ:',
    contact: [
      ['ವೇದಿಕೆ', 'ರೈತಮಾರ್ಗ'],
      ['ವೆಬ್‌ಸೈಟ್', 'https://raitha-marga.vercel.app'],
      ['ಬೆಂಬಲ ಸಹಾಯವಾಣಿ / WhatsApp', '+91 94800 00000 / ಬೆಳಗ್ಗೆ 7 ರಿಂದ ರಾತ್ರಿ 9 ರವರೆಗೆ ಲಭ್ಯ'],
      ['ಆಪರೇಷನ್ಸ್ ಇಮೇಲ್', 'support@raithamarga.in'],
      ['ವಿಳಾಸ', 'ರೈತಮಾರ್ಗ ರೈತ ಬೆಂಬಲ ಕೇಂದ್ರ, ಕರ್ನಾಟಕ, ಭಾರತ'],
    ],
    closing: 'ಅಗತ್ಯವಿದ್ದಾಗ ಈ ನೀತಿಗಳನ್ನು ನವೀಕರಿಸುವ ಹಕ್ಕನ್ನು ರೈತಮಾರ್ಗ ಕಾಯ್ದಿರಿಸುತ್ತದೆ. ನವೀಕರಿಸಿದ ನೀತಿಗಳನ್ನು ಈ ಪುಟದಲ್ಲಿ ಪ್ರಕಟಿಸಲಾಗುತ್ತದೆ.',
  },
};

const Policies = () => {
  const { language } = useLanguage();
  const content = policies[language === 'kn' ? 'kn' : 'en'];

  return (
    <>
      <main className="policies-page">
        <header className="policies-page__header">
          <Link to="/" className="policies-page__brand" aria-label="RaithaMarga home">
            <img src={logoMark} alt="" width="42" height="42" />
            <span>RaithaMarga</span>
          </Link>
          <Link to="/" className="policies-page__back">
            {language === 'kn' ? 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ' : 'Back to home'}
          </Link>
        </header>

        <div className="policies-page__content">
          <div className="policies-page__intro">
            <span className="policies-page__eyebrow">{content.tagline}</span>
            <h1>{language === 'kn' ? 'ರೈತಮಾರ್ಗ ನೀತಿಗಳು' : 'RaithaMarga – Policies'}</h1>
            <p>{content.welcome}</p>
            <p>{content.agreement}</p>
            <p className="policies-page__updated">{content.updated}</p>
          </div>

          <div className="policies-page__list">
            {content.sections.map((section, index) => (
              <section className="policies-card" key={section.title}>
                <span className="policies-card__number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h2>{section.title}</h2>
                  {section.intro && <p className="policies-card__intro">{section.intro}</p>}
                  {section.points && (
                    <ul>
                      {section.points.map((point) => <li key={point}>{point}</li>)}
                    </ul>
                  )}
                  {section.groups?.map((group) => (
                    <div className="policies-card__group" key={group.title}>
                      <h3>{group.title}</h3>
                      <ul>
                        {group.points.map((point) => <li key={point}>{point}</li>)}
                      </ul>
                    </div>
                  ))}
                  {section.note && <p className="policies-card__note">{section.note}</p>}
                </div>
              </section>
            ))}

            <section className="policies-card policies-card--contact">
              <div>
                <h2>{content.contactTitle}</h2>
                <p className="policies-card__intro">{content.contactIntro}</p>
                <dl className="policies-contact">
                  {content.contact.map(([label, value]) => (
                    <div className="policies-contact__row" key={label}>
                      <dt>{label}</dt>
                      <dd>
                        {value.startsWith('https://')
                          ? <a href={value} target="_blank" rel="noreferrer">{value}</a>
                          : value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="policies-card__note">{content.closing}</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Policies;
