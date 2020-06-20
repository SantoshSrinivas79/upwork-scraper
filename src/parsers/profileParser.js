const profileParser = async ({ requestQueue, $, request }) => {
    const name = $('title').text();
    const freelancer = {
        name,
    };
    console.log(freelancer);
};

module.exports = {
    profileParser,
}