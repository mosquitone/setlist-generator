import puppeteer from "puppeteer"
import chrome from "chrome-aws-lambda"
import { NowRequest, NowResponse } from "@now/node"
import { resolveSoa } from "dns"

const fontURLs = [
    'https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf',
    'https://raw.githack.com/googlefonts/noto-cjk/master/NotoSansJP-Regular.otf',
    'https://raw.githack.com/googlefonts/noto-cjk/master/NotoSansJP-Regular.otf',
]

const captureNode = async (url: string, selector: string, type: "png" | "jpeg") => {
    try {
        await Promise.all(fontURLs.map((url) => chrome.font(url)));
    } catch (error) {
        console.error(`error occured while downloading fonts: ${error}`)
    }
    const browser = await puppeteer.launch({
        args: chrome.args,
        executablePath: await chrome.executablePath,
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


export default async function print(req: NowRequest, res: NowResponse) {
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
