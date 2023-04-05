const rp = require('request-promise'); // network requests
const cheerio = require('cheerio'); // virtual DOM
const { info } = require('./env'); // info to submit

async function main(job_url) {
    const job_posting_response = await rp(job_url); //grab the job listing
    const $ = cheerio.load(job_posting_response); // parse the DOM
    try {
        const example_json = JSON.parse(($('code').find('div').map((idx, el) => { return $(el).text().replace(/\d+/, '')}).toArray().join('\n')).replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m)); // hack to remove the line counts, get text with new lines [vs using $().text()], remove comments and parse JSON
        info.job_id = example_json.job_id; // stuff the job id into the info object
        const submission_response = await rp({
            url: 'https://contact.plaid.com/jobs',
            method: 'POST',
            json: true,
            body: info
        }); // ship it
        console.log(`response: ${submission_response}`);
    }
    catch (e) {
        console.log(`err: ${e}`);
    }
}

main('https://plaid.com/careers/openings/engineering/united-states/experienced-software-engineer-api-access/').then(() => {
    console.log('Done');
});