const Apify = require('apify');
const { log } = require('../tools');

exports.profileParser = async ({ page, request, extendOutputFunction }) => {
    log.debug('Profile url...');

    await page.waitForFunction('window.PROFILE_RESPONSE !== null');
    const profileResponse = await page.evaluate(() => window.PROFILE_RESPONSE);
    const { profile, stats } = profileResponse.details.profile;
    const freelancer = {
        name: profile.name,
        location: profile.location,
        title: profile.title,
        description: profile.description,
        jobSuccess: stats.nSS100BwScore,
        hourlyRate: stats.hourlyRate,
        earned: stats.totalRevenue,
        numberOfJobs: stats.totalJobsWorked,
        hoursWorked: stats.totalHours,
        profileUrl: request.url,
    };

    let userResult = {};
    if (extendOutputFunction) {
        userResult = await page.evaluate((functionStr) => {
            // eslint-disable-next-line no-eval
            const f = eval(functionStr);
            return f();
        }, extendOutputFunction);
    }

    Object.assign(freelancer, userResult);

    await Apify.pushData(freelancer);
};
