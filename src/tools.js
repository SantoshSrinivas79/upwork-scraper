const Apify = require('apify');
const { EnumURLTypes } = require('./constants');

const { log } = Apify.utils;
log.setLevel(log.LEVELS.DEBUG);

exports.log = log;

exports.goToNextPage = async ({ requestQueue, $, request, session }) => {
    const { maxItems } = await Apify.getInput();
    const dataset = await Apify.openDataset();
    const { itemCount } = await dataset.getInfo();

    log.debug('Max items before go to next page:', maxItems, itemCount);
    if (itemCount >= maxItems) {
        return;
    }

    const doesNotHaveNextPage = $('.pagination-next').hasClass('disabled');
    if (doesNotHaveNextPage) {
        return;
    }

    const searchParams = new URLSearchParams(request.url);
    const page = Number(searchParams.get('page')) || 1;

    searchParams.set('page', page + 1);

    await requestQueue.addRequest({ url: unescape(searchParams.toString()) });
};

exports.getUrlType = (url = '') => {
    let type = null;

    if (url.match(/upwork\.com\/*$/)) {
        type = EnumURLTypes.START_URL;
    }

    if (url.match(/upwork\.com\/hire.+/)) {
        type = EnumURLTypes.CATEGORY;
    }

    if (url.match(/upwork\.com\/search\/profiles.+/)) {
        type = EnumURLTypes.PROFILE_SEARCH;
    }

    if (url.match(/upwork\.com\/search\/jobs.+/)) {
        type = EnumURLTypes.JOB_SEARCH;
    }

    if (url.match(/upwork\.com\/o\/profiles\/users.+/)) {
        type = EnumURLTypes.PROFILE;
    }

    return type;
};
