import scraperV1, { IScaperV1Config } from "./scrapers/v1";
import fs from "fs";

const config: IScaperV1Config = {
    siteURL: "https://www.bbc.com/news",
    card: {
      tag: "div",
      classes: [
        "nw-c-top-stories__primary-item",
        "nw-c-top-stories__secondary-item",
        "nw-c-top-stories__tertiary-item",
      ],
    },
    link: {
      tag: "a",
      classes: ["gs-c-promo-heading"],
      fallbackBaseURL: "https://www.bbc.com/",
    },
    cardTitle: {
      tag: "h3",
      classes: ["gs-c-promo-heading__title"],
    },
    cardSummary: {
      tag: "p",
      classes: ["gs-c-promo-summary"],
    },
    content: {
      tag: "p",
      classes: ["ssrcss-1q0x1qg-Paragraph"],
    },
  };

scraperV1(config).then((res) =>
  fs.writeFileSync(`data/${Date.now()}.json`, JSON.stringify(res))
);
