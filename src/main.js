const Apify = require('apify');
const safeEval = require('safe-eval');
const cheerio = require('cheerio');
const { log, getUrlType } = require('./tools');
const { EnumURLTypes, EnumBaseUrl } = require('./constants');
const { profileParser } = require('./parsers');

Apify.main(async () => {
    const input = await Apify.getInput();

    const { proxy, startUrls, maxItems, search, extendOutputFunction } = input;

    if (!startUrls && !search) {
        throw new Error('startUrls or search parameter must be provided!');
    }

    const requestQueue = await Apify.openRequestQueue();

    if (startUrls && startUrls.length) {
        await Promise.all(startUrls.map((url) => {
            return requestQueue.addRequest({
                url,
            });
        }));
    }

    if (search) {
        // await requestQueue.addRequest({ url: getSearchUrl(search), userData: { type: EnumURLTypes.SEARCH } });
    }

    const dataset = await Apify.openDataset();
    const { itemCount } = await dataset.getInfo();

    let extendOutputFunctionObj;
    if (typeof extendOutputFunction === 'string' && extendOutputFunction.trim() !== '') {
        try {
            extendOutputFunctionObj = safeEval(extendOutputFunction);
        } catch (e) {
            throw new Error(`'extendOutputFunction' is not valid Javascript! Error: ${e}`);
        }
        if (typeof extendOutputFunctionObj !== 'function') {
            throw new Error('extendOutputFunction is not a function! Please fix it or use just default ouput!');
        }
    }


    const crawler = new Apify.BasicCrawler({
        requestQueue,
        useSessionPool: true,

        handleRequestFunction: async ({ request, session }) => {
            if (itemCount >= maxItems) {
                log.info('Actor reached the max items limit. Crawler is going to halt...');
                log.info('Crawler Finished.');
                process.exit();
            }


            log.info(`Processing ${request.url}...`);

            const requestOptions = {
                url: request.url,
                proxyUrl: Apify.getApifyProxyUrl({
                    groups: proxy.apifyProxyGroups,
                    session: session.id,
                }),
            };
            const { body } = await Apify.utils.requestAsBrowser(requestOptions);
            const $ = cheerio.load(body);

            const type = getUrlType(request.url);

            log.debug('Url type:', type);

            if (type === EnumURLTypes.CATEGORY) {
                log.debug('Category url...');

                const profiles = $('#profiles-container .v5-tile');

                await Array.from(profiles).reduce(async (previous, profile) => {
                    await previous;
                    const nameLink = $(profile).find('.name-link');
                    const profileUrl = EnumBaseUrl.MAIN_URL + $(nameLink).find('a[data-qa=name]').attr('href');

                    await requestQueue.addRequest({ url: profileUrl });
                }, Promise.resolve());
            }

            if (type === EnumURLTypes.PROFILE) {
                await profileParser({ requestQueue, $, request, session });
            }
        },

        handleFailedRequestFunction: async ({ request }) => {
            log.warning(`Request ${request.url} failed too many times`);
        },
    });

    await crawler.run();
});
