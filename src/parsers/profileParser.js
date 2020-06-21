

const Apify = require('apify');

exports.profileParser = async ({ requestQueue, page, request }) => {
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

    console.log(freelancer);

    await Apify.pushData(freelancer);
};
