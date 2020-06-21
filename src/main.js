const Apify = require('apify');
const safeEval = require('safe-eval');
const { log, getUrlType, goToNextPage } = require('./tools');
const { EnumURLTypes } = require('./constants');
const { profileParser, categoryParser, profileSearchParser } = require('./parsers');

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

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        useSessionPool: true,
        persistCookiesPerSession: true,
        launchPuppeteerOptions: {
            ...proxy,
            stealth: true,
        },
        handlePageFunction: async (context) => {
            const dataset = await Apify.openDataset();
            const { itemCount } = await dataset.getInfo();

            if (itemCount >= maxItems) {
                log.info('Actor reached the max items limit. Crawler is going to halt...');
                log.info('Crawler Finished.');
                process.exit();
            }
            const { page, request, session } = context;
            log.info(`Processing ${request.url}...`);

            const title = await page.title();

            if (title.includes('denied')) {
                session.retire();
                await page.waitFor(30000);
                throw new Error('Page blocked');
            }

            const type = getUrlType(request.url);

            switch (type) {
                case EnumURLTypes.CATEGORY:
                    return categoryParser({ requestQueue, ...context });
                case EnumURLTypes.JOB_SEARCH:
                    console.log('job search page');
                    return;
                case EnumURLTypes.PROFILE_SEARCH:
                    await profileSearchParser({ requestQueue, ...context });
                    return goToNextPage({ requestQueue, ...context, itemCount, maxItems });
                case EnumURLTypes.PROFILE:
                    return profileParser({ requestQueue, ...context });
                default:
                    log.warning('Url does not match any parser');
            }
        },
    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');
});
