export type Language = 'english' | 'pidgin';

export type TranslationKey =
  | 'verifyBeforeYouPay'
  | 'searchPlaceholder'
  | 'searchButton'
  | 'trustScore'
  | 'verifiedSafe'
  | 'caution'
  | 'highRisk'
  | 'danger'
  | 'totalReports'
  | 'mostRecentReport'
  | 'noReportsFound'
  | 'noReportsDesc'
  | 'copyAccountNumber'
  | 'copied'
  | 'shareOnWhatsApp'
  | 'reportScam'
  | 'reportScamTitle'
  | 'accountNumber'
  | 'bankName'
  | 'phoneNumber'
  | 'businessName'
  | 'amountLost'
  | 'howScamHappened'
  | 'description'
  | 'uploadEvidence'
  | 'submitReport'
  | 'reportSubmitted'
  | 'reportSubmittedDesc'
  | 'recentScams'
  | 'recentScamsTitle'
  | 'confirmedVictims'
  | 'confirmExperience'
  | 'verifyBusiness'
  | 'verifyBusinessTitle'
  | 'cacNumber'
  | 'ownerName'
  | 'email'
  | 'businessCategory'
  | 'submitApplication'
  | 'applicationReceived'
  | 'applicationReceivedDesc'
  | 'about'
  | 'aboutTitle'
  | 'howItWorks'
  | 'faq'
  | 'disclaimer'
  | 'disclaimerText'
  | 'selectBank'
  | 'selectScamType'
  | 'loading'
  | 'errorOccurred'
  | 'noScamsYet'
  | 'viewDetails'
  | 'hideDetails'
  | 'installApp'
  | 'installNow'
  | 'later'
  | 'offlineNotice'
  | 'verified'
  | 'pending'
  | 'searchResults'
  | 'whatPeopleReported'
  | 'enterSearchTerm'
  | 'searching'
  | 'reportAnother'
  | 'submitAnother'
  | 'enterAccountNumber'
  | 'enterPhoneNumber'
  | 'enterBusinessName';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  english: {
    verifyBeforeYouPay: 'Verify Before You Pay',
    searchPlaceholder: 'Enter bank account number, phone number, or business name',
    searchButton: 'Search',
    trustScore: 'Trust Score',
    verifiedSafe: 'Verified Safe',
    caution: 'Caution',
    highRisk: 'High Risk',
    danger: 'Danger — Do Not Pay',
    totalReports: 'Total Reports',
    mostRecentReport: 'Most Recent Report',
    noReportsFound: 'No Reports Found',
    noReportsDesc: 'This account has not been reported. Always stay vigilant.',
    copyAccountNumber: 'Copy Account Number',
    copied: 'Copied!',
    shareOnWhatsApp: 'Share on WhatsApp',
    reportScam: 'Report Scam',
    reportScamTitle: 'Report a Scammer',
    accountNumber: 'Account Number',
    bankName: 'Bank Name',
    phoneNumber: 'Phone Number',
    businessName: 'Business Name',
    amountLost: 'Amount Lost (₦)',
    howScamHappened: 'How the Scam Happened',
    description: 'Description of What Happened',
    uploadEvidence: 'Upload Evidence Screenshot',
    submitReport: 'Submit Report',
    reportSubmitted: 'Report Submitted!',
    reportSubmittedDesc: 'Thank you for helping protect the community. Your report is now visible to others.',
    recentScams: 'Recent Scams',
    recentScamsTitle: 'Latest Reported Scams',
    confirmedVictims: 'confirmed this scam',
    confirmExperience: 'Confirm Same Experience',
    verifyBusiness: 'Verify Business',
    verifyBusinessTitle: 'Apply for Verified Badge',
    cacNumber: 'CAC Registration Number',
    ownerName: 'Owner Name',
    email: 'Email',
    businessCategory: 'Business Category',
    submitApplication: 'Submit Application',
    applicationReceived: 'Application Received',
    applicationReceivedDesc: 'Your application is under review. We will contact you within 5 business days.',
    about: 'About',
    aboutTitle: 'About VerifyNG',
    howItWorks: 'How It Works',
    faq: 'Frequently Asked Questions',
    disclaimer: 'Disclaimer',
    disclaimerText: 'Reports are community-submitted and have not been independently verified. Use your judgment.',
    selectBank: 'Select a bank',
    selectScamType: 'Select scam type',
    loading: 'Loading...',
    errorOccurred: 'Something went wrong. Please try again.',
    noScamsYet: 'No scams reported yet. Be the first to report.',
    viewDetails: 'View Details',
    hideDetails: 'Hide Details',
    installApp: 'Install VerifyNG',
    installNow: 'Install Now',
    later: 'Later',
    offlineNotice: 'You are offline. Showing cached results.',
    verified: 'Verified',
    pending: 'Pending',
    searchResults: 'Search Results',
    whatPeopleReported: 'What People Reported',
    enterSearchTerm: 'Please enter a search term',
    searching: 'Searching...',
    reportAnother: 'Report Another Scam',
    submitAnother: 'Submit Another Application',
    enterAccountNumber: 'Enter 10-digit account number',
    enterPhoneNumber: 'Enter phone number',
    enterBusinessName: 'Enter business name',
  },
  pidgin: {
    verifyBeforeYouPay: 'Check Well Before You Pay',
    searchPlaceholder: 'Put account number, phone number, or business name',
    searchButton: 'Search',
    trustScore: 'Trust Score',
    verifiedSafe: 'Verified Safe',
    caution: 'Caution',
    highRisk: 'High Risk',
    danger: 'Danger — No Pay!',
    totalReports: 'How Many People Report Am',
    mostRecentReport: 'Last Report Date',
    noReportsFound: 'Nobody Report This One',
    noReportsDesc: 'This account never show for our records. Still shine your eye well well.',
    copyAccountNumber: 'Copy Account Number',
    copied: 'Don Copy!',
    shareOnWhatsApp: 'Share for WhatsApp',
    reportScam: 'Report Scam',
    reportScamTitle: 'Report Person We Scam You',
    accountNumber: 'Account Number',
    bankName: 'Bank Name',
    phoneNumber: 'Phone Number',
    businessName: 'Business Name',
    amountLost: 'Money We You Lose (₦)',
    howScamHappened: 'How the Scam Take Happen',
    description: 'Wetin Happen',
    uploadEvidence: 'Upload Screenshot Proof',
    submitReport: 'Submit Report',
    reportSubmitted: 'Report Don Enter!',
    reportSubmittedDesc: 'Thank you for helping protect the community. Your report is now visible to others.',
    recentScams: 'Recent Scams',
    recentScamsTitle: 'Latest Scams People Report',
    confirmedVictims: 'people confirm this scam',
    confirmExperience: 'Confirm Say E Scam You Too',
    verifyBusiness: 'Verify Business',
    verifyBusinessTitle: 'Apply for Verified Badge',
    cacNumber: 'CAC Registration Number',
    ownerName: 'Owner Name',
    email: 'Email',
    businessCategory: 'Business Category',
    submitApplication: 'Submit Application',
    applicationReceived: 'Application Don Enter',
    applicationReceivedDesc: 'We dey review your application. We go reach you within 5 working days.',
    about: 'About',
    aboutTitle: 'About VerifyNG',
    howItWorks: 'How E Take Work',
    faq: 'Questions People Dey Ask',
    disclaimer: 'Disclaimer',
    disclaimerText: 'Na community people submit all these reports. We never verify them independently. Use your sense.',
    selectBank: 'Select bank',
    selectScamType: 'Select the kind scam',
    loading: 'Loading...',
    errorOccurred: 'Something go wrong. Try again.',
    noScamsYet: 'Nobody don report scam yet. Be the first.',
    viewDetails: 'See Details',
    hideDetails: 'Hide Details',
    installApp: 'Install VerifyNG',
    installNow: 'Install Now',
    later: 'Later',
    offlineNotice: 'You dey offline. We dey show old results.',
    verified: 'Verified',
    pending: 'Pending',
    searchResults: 'Search Results',
    whatPeopleReported: 'Wetin People Talk',
    enterSearchTerm: 'Please put something to search',
    searching: 'Dey search...',
    reportAnother: 'Report Another Scam',
    submitAnother: 'Submit Another Application',
    enterAccountNumber: 'Put 10-digit account number',
    enterPhoneNumber: 'Put phone number',
    enterBusinessName: 'Put business name',
  },
};
