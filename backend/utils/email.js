const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const isGmailAddress = (email = '') => GMAIL_REGEX.test(normalizeEmail(email));

module.exports = {
  normalizeEmail,
  isGmailAddress
};
