const Apify = require('apify');
const { EnumURLTypes } = require('./constants');

const { log } = Apify.utils;
log.setLevel(log.LEVELS.DEBUG);

exports.log = log;

exports.getUrlType = (url = '') => {
    let type = null;

    if (url.match(/upwork\.com\/*$/)) {
        type = EnumURLTypes.START_URL;
    }

    if (url.match(/upwork\.com\/hire.+/)) {
        type = EnumURLTypes.CATEGORY;
    }

    if (url.match(/upwork\.com\/o\/profiles\/users.+/)) {
        type = EnumURLTypes.PROFILE;
    }

    return type;
};
