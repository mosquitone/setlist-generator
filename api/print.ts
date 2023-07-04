import puppeteer from "puppeteer-core"
import chrome from "@sparticuz/chromium-min"
import { VercelRequest, VercelResponse } from "@vercel/node"

const fontURLs = [
    'https://rawcdn.githack.com/googlefonts/noto-emoji/9a5261d871451f9b5183c93483cbd68ed916b1e9/fonts/NotoEmoji-Regular.ttf',
    'https://rawcdn.githack.com/google/fonts/57311b5baf175fa1bdbf055d5ccb50e53d19e745/ofl/notosansjp/NotoSansJP-Regular.otf',
]

chrome.setGraphicsMode = false;

const captureNode = async (url: string, selector: string, type: "png" | "jpeg") => {
    try {
        await Promise.all(fontURLs.map((url) => chrome.font(url)));
    } catch (error) {
        console.error(`error occured while downloading fonts: ${error}`)
    }
    const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath(process.env.CHROME_EXECUTABLE_PATH),
        headless: chrome.headless,
    });
    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });
        await page.evaluate(() => document.body.style.background = 'transparent');
        const elements = await page.$$(selector);
        const container = elements[0];
        const imageBuffer = await container.screenshot({ type, encoding: 'binary', omitBackground: true });
        return imageBuffer;
    } catch (e) {
        throw e;
    }
    finally {
        await browser.close();
    }
}


export default async function print(req: VercelRequest, res: VercelResponse) {
    const { url, selector, filename = "image", type = "png" } = req.query;
    if (typeof url !== 'string' || 
        typeof selector !== 'string' || 
        typeof filename !== 'string' || 
        !(type === 'jpeg' || type === 'png')) {
        res.status(400).end();
        return;
    }
    console.debug(`try capture ${selector} on ${url}`);
    try {
        res.setHeader('content-type', `image/${type}`);
        res.setHeader('content-disposition', `attachment; filename="${filename}.${type}`);
        res.write("");
        const imageBuffer = await captureNode(url, selector, type)
        console.debug(`success capture`);
        res.write(imageBuffer);
        res.end();
    } catch (error) {
        console.error(`error occured while caputuring image: ${error}`);
        res.status(500).end();
    }
}
