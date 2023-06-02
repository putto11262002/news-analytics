import path from "path";
import scraperV1, { IScaperV1Config } from "../../../service/v1";
import logger from "../../../until/logger";


export interface ITask {
  homePage: {
    url: string;
    link: {
      selector: string;
      attr: string;
    }
  };
  newsPage: {
    title: {
      selector: string;
      attr: string;
    };
    content: {
      selector: string;
      attr: string;
    };
    timestamp: {
      selector: string;
      attr: string;
    };
  };
}

export interface INewsV1 {
  title?: string;
  content?: string;
  timestamp?: Date;
  scrapedTimestamp?: Date;
  format?: string;
}

export const run = async (task: ITask) => {
  var news: INewsV1[] = [];

  const { results } = await scraperV1({
    url: task.homePage.url,
    elSpecs: [
      {
        key: "link",
        target: {
          selector: task.homePage.link.selector,
          
        },
        return: { attributes: [task.homePage.link.attr], nth: "*" },
      },
    ],
  });



  for (let link of results.link) {
    // scrape news page
    let url = link[task.homePage.link.attr]
    if (!url) {
      continue;
    }
    let { results, timestamp, scrapperVersion} = await scraperV1({
      url,
      elSpecs: [
        {
          key: "title",
          target: {
            selector: task.newsPage.title.selector,
          },
          return: {
            attributes: [task.newsPage.title.attr],
            nth: 1,
          },
        },
        {
          key: "content",
          target: {
            selector: task.newsPage.content.selector,
          },
          return: {
            attributes: [task.newsPage.content.attr],
            nth: "*",
          },
        },
        {
          key: "timestamp",
          target: {
            selector: task.newsPage.timestamp.selector
          },
          return: {
            attributes: [task.newsPage.timestamp.attr],
            nth: 1
          }
        }
      ],
    });

    news.push({
      title: results?.title[0][task.newsPage.title.attr],
      content: results.content.map((c) => c[task.newsPage.content.attr]).join(""),
      scrapedTimestamp: timestamp,
      format: "scape-headline-news.runner/v1",
      timestamp: new Date(results.timestamp[0][task.newsPage.timestamp.attr] || Date.now())
    });
  }

  return news;
};
