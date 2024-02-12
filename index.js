// scraper.js

const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeCompany(companyName) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the LinkedIn page of the company
    await page.goto(`https://www.linkedin.com/company/${companyName}`, {
        waitUntil: 'networkidle2',
    });

    // Extract relevant data (company name, website link, LinkedIn page URL, contact info)
    // ...

    // Close the browser
    await browser.close();

    return {
        companyName,
        websiteLink,
        linkedinUrl,
        email,
        phone,
    };
}

async function main() {
    const companies = [
        // List of company names
        // ...
    ];

    const data = [];

    for (const company of companies) {
        const result = await scrapeCompany(company);
        if (result) {
            data.push(result);
        }
    }

    // Create a CSV file
    const csvFileName = `companies_data_${Date.now()}.csv`;
    const stream = fs.createWriteStream(csvFileName);
    stream.write('Company Name,Website Link,LinkedIn Page URL,Email,Phone\n');

    for (const item of data) {
        stream.write(`${item.companyName},${item.websiteLink},${item.linkedinUrl},${item.email},${item.phone}\n`);
    }

    stream.end();
    console.log(`CSV file saved as ${csvFileName}`);
}

main();
