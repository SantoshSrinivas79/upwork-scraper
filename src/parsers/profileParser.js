const safeEval = require('safe-eval');
const Apify = require('apify');

exports.profileParser = async ({ requestQueue, $, request, session }) => {
    const scriptTags = $('script');

    const script = Array.from(scriptTags).reduce((found, el) => {
        const candidate = el.children.find(({ data }) => data.startsWith('window.PROFILE_RESPONSE='));
        if (candidate) {
            [, found] = candidate.data.split('window.PROFILE_RESPONSE=');
        }
        return found;
    });
    const profileResponse = safeEval(script);
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

    await Apify.pushData(freelancer);
};
