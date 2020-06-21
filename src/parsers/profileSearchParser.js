const { log, goToNextPage, splitUrl } = require('../tools');
const { EnumBaseUrl } = require('../constants');

exports.profileSearchParser = async ({ requestQueue, request, page, session }) => {
    log.debug('Profile search url...');

    const profiles = await page.$$eval('div[data-freelancer=profile]', ($profiles) => {
        const data = [];
        $profiles.forEach(($profile) => {
            const profileUrl = $profile.querySelector('a[data-qa=tile_name]').href;
            data.push(profileUrl);
        });

        return data;
    });

    await profiles.reduce(async (previous, profileUrl) => {
        await previous;
        const url = splitUrl(profileUrl);
        await requestQueue.addRequest({ url });
    }, Promise.resolve());

    // TODO: Fix
    // await goToNextPage({ $, requestQueue, session, request });
};
