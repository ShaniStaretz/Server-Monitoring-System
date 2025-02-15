const REGEX_PARTTERNS = {
  server_url: /^(ftp|http|https|ssh):\/\/([^\/:]+)(?::(\d+))?/i,
  date_time:
    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
};
// Export the object
module.exports = { REGEX_PARTTERNS };
