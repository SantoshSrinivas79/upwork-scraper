const { log, goToNextPage } = require('../tools');
const { EnumBaseUrl } = require('../constants');

exports.profileSearchParser = async ({ requestQueue, $, request, session }) => {
    log.debug('Profile search url...');

    const profiles = $('div[data-freelancer=profile]');

    await Array.from(profiles).reduce(async (previous, profile) => {
        await previous;
        console.log(profile.type, profile.name, profile.children);
        const tileName = $(profile).find('a[data-qa=tile_name]');
        const profileUrl = EnumBaseUrl.MAIN_URL + $(tileName).attr('href');
        console.log(profileUrl);

        await requestQueue.addRequest({ url: profileUrl });
    }, Promise.resolve());

    // await goToNextPage({ $, requestQueue, session, request });
};
