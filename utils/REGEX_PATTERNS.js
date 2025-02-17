const REGEX_PARTTERNS = {
  SERVER_URL: /^(?:(ftp|http|https|ssh):\/\/)?([^\/:]+)/i,
  DATE_TIME:
    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
};
// Export the object
module.exports = { REGEX_PARTTERNS };
