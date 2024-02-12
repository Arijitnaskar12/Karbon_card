const puppeteer = require('puppeteer');
const fs = require('fs');

async function login(page) {
    // Navigate to the LinkedIn login page
    await page.goto('https://www.linkedin.com/login', {
        waitUntil: 'domcontentloaded'
    });

    // Input the username and password
    await page.type('#username', 'YourUsernameHere'); // Replace 'YourUsernameHere' with your actual LinkedIn username
    await page.type('#password', 'YourPasswordHere'); // Replace 'YourPasswordHere' with your actual LinkedIn password

    // Click the sign-in button
    await page.click('.btn__primary--large');
    
    // Wait for login to complete
    await page.waitForNavigation();
}

async function scrapeCompany(companyName) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(300000); 
    // Login to LinkedIn
    await login(page);

    // Navigate to the LinkedIn page of the company
    await page.goto(`https://www.linkedin.com/company/${companyName}`, {
        waitUntil: 'networkidle2',
    });

    // Click on the "About" section to reveal detailed company information
    await page.click('a[data-control-name="about_company_module_about_link"]');

    // Wait for the detailed information to load
    await page.waitForSelector('.org-page-details__employees-on-linkedin');

    // Extract CEO details
    const ceoInfo = await page.evaluate(() => {
        const ceoElement = document.querySelector('.org-page-details__definition-text');
        const ceoName = ceoElement ? ceoElement.textContent.trim() : 'N/A';
        const ceoEmail = ceoElement?.nextElementSibling?.textContent.trim() || 'N/A';
        return { ceoName, ceoEmail };
    });

    // Extract other relevant data (company name, website link, LinkedIn page URL)
    const companyDetails= await page.evaluate(() => {
        return document.querySelector('.org-top-card-summary__title').textContent.trim();
    });

    const websiteLink = await page.evaluate(() => {
        const websiteElement = document.querySelector('.org-top-card-summary__domain');
        return websiteElement ? websiteElement.textContent.trim() : 'N/A';
    });

    const linkedinUrl = page.url();

    // Close the browser
    await browser.close();

    return {
        companyDetails,
        websiteLink,
        linkedinUrl,
        ceoName: ceoInfo.ceoName,
        ceoEmail: ceoInfo.ceoEmail,
    };
}

async function main() {
    const companies = [
      "Arista Networks"
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
    stream.write('Company Name,Website Link,LinkedIn Page URL,CEO Name,CEO Email\n');

    for (const item of data) {
        stream.write(`${item.companyName},${item.websiteLink},${item.linkedinUrl},${item.ceoName},${item.ceoEmail}\n`);
    }

    stream.end();
    console.log(`CSV file saved as ${csvFileName}`);
}

main();
