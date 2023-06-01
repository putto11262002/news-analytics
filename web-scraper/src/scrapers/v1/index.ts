import axios from "axios";
import cheerio, { CheerioAPI } from "cheerio";


const fetchPage = async (pageUrl: string) => {
  const res = await axios.get(pageUrl);
  const data = res.data;
  return data;
};

const addBaseURLToLink = (link: string, fallBackUrl: string) => {
  if (/^https?:\/\//.test(link)) {
    return link;
  }
  const newLink = new URL(link, fallBackUrl);
  return newLink.toString();
};

const getElsByTagAndClassRegex = (
  $: CheerioAPI,
  targetTag: string,
  targetClassRegex: RegExp
) => {
  const els = $(targetTag).filter((i, el) => {
    const elClass = $(el).attr("class");
    if (!elClass) return false;
    if (targetClassRegex.test(elClass)) {
      return true;
    }
    return false;
  });

  return els.toArray();
};


const getFirstElByTagAndClassRegex = (
  $: CheerioAPI,
  targetTag: string,
  targetClassRegex: RegExp
) => {
  for (let el of $(targetTag).toArray()) {
    const elClass = $(el).attr("class");
    if (!elClass) continue;
    if (targetClassRegex.test(elClass)) {
      return el;
    }
  }
  return undefined;
};

/**
 * Create regular expression based on a list of class names. 
 * The regular expression matches a string that contain any of the supplied class names
 * @param classes
 * @returns
 */
const createRegex = (classes: string[]) => {
  return new RegExp(`(${classes.join("|")})`, "gi");
};

export interface IElSpec {
  tag: string;
  classes: string[];
}

export interface IATagSpec extends IElSpec {
  fallbackBaseURL: string;
}
export interface IScaperV1Config {
  siteURL: string;
  card: IElSpec;
  cardTitle: IElSpec;
  cardSummary: IElSpec;
  link: IATagSpec;
  content: IElSpec;
}

export interface IScraperV1News {
  title: string;
  link: string;
  summary?: string;
  content?: string;
  datetime: Date;
  scraper: string;
}

/**
 * Scrape each card title, summary and link 
 * then use the card link to navigate to the news page and scape the news content
 * @param config Scraping configuraiton
 * @returns A List of news objects
 */
const scraperV1 = async (config: IScaperV1Config) => {
  console.log("Fetching", config.siteURL, '...')
  const homePage = await fetchPage(config.siteURL);

  console.log("Scraping", config.siteURL, config.card.tag, config.card.classes.join(',') , '...')
  const newsCardEls = getElsByTagAndClassRegex(
    cheerio.load(homePage),
    config.card.tag,
    createRegex(config.card.classes)
  );

  const news = await Promise.all(
    newsCardEls.map(async (el) => {
    
      const $ = cheerio.load(el);

      const linkEl = getFirstElByTagAndClassRegex(
        $,
        config.link.tag,
        createRegex(config.link.classes)
      );
      const href = $(linkEl).attr("href");
      const link = href
        ? addBaseURLToLink(href, config.link.fallbackBaseURL)
        : undefined;

      const titleEls = getFirstElByTagAndClassRegex(
        $,
        config.cardTitle.tag,
        createRegex(config.cardTitle.classes)
      );
      const title = $(titleEls).text();

      const summaryEls = getFirstElByTagAndClassRegex(
        $,
        config.cardSummary.tag,
        createRegex(config.cardSummary.classes)
      );
      const summary = $(summaryEls).text();

      let content: string | undefined = undefined;

      if (link) {
        console.log("Fetching", link, config.content.tag, config.content.classes.join(','), "...")
        const newsPage = await fetchPage(link);
        const contents = getElsByTagAndClassRegex(
          cheerio.load(newsPage),
          config.content.tag,
          createRegex(config.content.classes)
        );
        console.log("Scraping", link, "...")
        content = contents.map((p) => $(p).text()).join("\n");
      }

      // console.log(
      //   "\n",
      //   {
      //     title,
      //     link,
      //     summary,
      //     content,
      //   },
      //   "\n"
      // );

      return {
        title,
        link,
        summary,
        content,
      };
    })
  );
  return news;
};

export default scraperV1;



