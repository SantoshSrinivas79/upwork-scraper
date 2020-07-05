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

    for (const profileUrl of profiles) {
        const url = splitUrl(profileUrl);
        await requestQueue.addRequest({ url });
    }
};
