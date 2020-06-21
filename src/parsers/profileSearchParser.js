const { log, splitUrl } = require('../tools');

exports.profileSearchParser = async ({ requestQueue, page }) => {
    log.debug('Profile search url...');

    await page.waitForSelector('div[data-freelancer=profile]');
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
};
