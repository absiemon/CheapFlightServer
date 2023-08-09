import puppeteer from 'puppeteer';

async function getFlightsFromPage(page) {
  try {
    await page.waitForSelector(".pIav2d");
    console.log("Line-8")
    return await page.evaluate(() =>
      Array.from(document.querySelectorAll(".pIav2d")).map((el) => {
        const thumbnailString = el.querySelector(".EbY4Pc")?.getAttribute("style");
        const startIndex = thumbnailString?.indexOf("url(");
        const endIndex = thumbnailString?.indexOf(";");
        const thumbnail = thumbnailString?.slice(startIndex + 4, endIndex - 1)?.replaceAll("\\", "") || "No thumbnail";
        const layover = el.querySelector(".BbR8Ec .sSHqwe")?.getAttribute("aria-label");
        return {
          thumbnail,
          companyName: el.querySelector(".Ir0Voe .sSHqwe")?.textContent.trim(),
          description: el.querySelector(".mv1WYe")?.getAttribute("aria-label"),
          departureTime: el.querySelector(".wtdjmc")?.textContent.trim(),
          arrivalTime: el.querySelector(".XWcVob")?.textContent.trim(),
          duration: el.querySelector(".gvkrdb")?.textContent?.trim(),
          airportLeave: el.querySelectorAll(".Ak5kof .sSHqwe .eoY5cb")[0]?.textContent?.trim(),
          airportArive: el.querySelectorAll(".Ak5kof .sSHqwe .eoY5cb")[1]?.textContent?.trim(),
          layover: layover || "Nonstop",
          emisions: el.querySelector(".V1iAHe > div")?.getAttribute("aria-label")?.replace(". Learn more about this emissions estimate", " "),
          price: el.querySelector(".U3gSDe .YMlIz > span")?.textContent.trim(),
          priceDescription: el.querySelector(".U3gSDe .JMnxgf > span > span > span")?.getAttribute("aria-label"),
        };
      })
    );
  } catch (error) {
    console.error('Error fetching flight details:', error);
    return []; // Return an empty array if there's an error
  }
}

async function getFlightsResults(source, destination, date, adults, childrens) {
  const browser = await puppeteer.launch({
    headless: false, // if you want to see what the browser is doing, you need to set this option to "false"
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--single-process", "--no-zygote"],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    console.log("Line-43")
    const URL = `https://www.google.com/travel/flights?tfs=CBwQARoOagwIAhIIL20vMGRsdjBAAUgBcAGCAQsI____________AZgBAg&hl=en-US&curr=INR`;
    const page = await browser.newPage();
    page.setViewport({
      width: 1280,
      height: 720,
    });
    console.log("Line-50")

    page.setDefaultNavigationTimeout(60000);
    await page.goto(URL);

    await page.waitForSelector('input[aria-labelledby="i22"]');
    await page.evaluate(() => {
      const sourceInput = document.querySelector('input[aria-labelledby="i22"]');
      sourceInput.value = '';
    });
    console.log("Line-60")

    await page.type('input[aria-labelledby="i22"]', source);
    await page.waitForTimeout(1000);
    await page.keyboard.press("ArrowDown"); // Select the first suggestion
    await page.keyboard.press("Enter");

    // Wait for the destination input to be visible and type the destination city
    await page.waitForTimeout(1000);

    console.log("Line-70")
    await page.waitForSelector('input[aria-labelledby="i28"]');
    await page.type('input[aria-labelledby="i28"]', destination);
    await page.waitForTimeout(1000);
    await page.keyboard.press("ArrowDown"); // Select the first suggestion
    await page.keyboard.press("Enter");

    await page.waitForTimeout(1000);

    // type "Leave date"
    console.log("Line-80")
    await page.click('input[aria-label="Departure"]');
    await page.keyboard.type(date);
    await page.keyboard.press("Enter");

    // // press "Done"
    await page.click(".VfPpkd-LgbsSe .VfPpkd-RLmnJb");
    await page.waitForTimeout(1000);
    await page.keyboard.press("Enter");

    console.log("Line-90")
    // checking extra passengers
    console.log(typeof (adults), childrens)
    if (adults > 1 || childrens > 0) {
      const res = await page.$$(".nCP5yc .VfPpkd-Jh9lGc");  //6
      await res[1].click();
      const buttons = await page.$$(".rGF6nb .VfPpkd-Jh9lGc"); // 8
      for (let i = 0; i < adults - 1; i++) {
        await buttons[1].click();
      }
      for (let i = 0; i < childrens; i++) {
        await buttons[3].click();
      }
      await page.waitForTimeout(1000);
      await page.click(".bRx3h .VfPpkd-Jh9lGc");
    }

    // press "Search"
    await page.waitForTimeout(2000);

    await page.click(".TUT4y .VfPpkd-Jh9lGc");
    await page.waitForTimeout(1000);
    await page.keyboard.press("Enter");
    console.log("Line-113")

    await page.waitForSelector(".zISZ5c");

    const moreButton = await page.$(".zISZ5c");
    if (moreButton) {
      await moreButton.click();
      await page.waitForTimeout(3000);
    }

    await page.waitForSelector(".FXkZv");
    const flights = await getFlightsFromPage(page);
    await page.waitForTimeout(3000);

    await page.waitForSelector(".FXkZv");
    const pageUrl = page.url();
    const key = 'sourceUrl';
    const updatedArray = await flights.map(obj => ({ ...obj, [key]: pageUrl }));
    return updatedArray;

  } catch (error) {
    console.error('Error occurred:', error);
    return []; // Return an empty array if there's an error
  } finally {
    await browser.close();
  }
}

export default getFlightsResults;
