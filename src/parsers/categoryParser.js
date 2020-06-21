const { log } = require('../tools');
const { EnumBaseUrl } = require('../constants');

exports.categoryParser = async ({ requestQueue, $, request, session }) => {
    log.debug('Category url...');

    const profiles = $('#profiles-container .v5-tile');

    await Array.from(profiles).reduce(async (previous, profile) => {
        await previous;
        const nameLink = $(profile).find('.name-link');
        const profileUrl = EnumBaseUrl.MAIN_URL + $(nameLink).find('a[data-qa=name]').attr('href');

        await requestQueue.addRequest({ url: profileUrl });
    }, Promise.resolve());
};
