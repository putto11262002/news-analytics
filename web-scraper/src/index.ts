import scraperV1, { IScaperV1Config } from "./scrapers/v1";

scraperV1({
  url: "https://www.bbc.com/news",
  elSpecs: [
    {
      key: "link",
      target: {
        selector:
          ".nw-c-top-stories__secondary-item a.gs-c-promo-heading, .nw-c-top-stories-primary__story a.gs-c-promo-heading",
      },
      return: { attributes: ["href"], nth: "*" },
    },
    {
      key: "title",
      target: {
        selector:
          ".nw-c-top-stories__secondary-item h3.gs-c-promo-heading__title, .nw-c-top-stories-primary__story h3.gs-c-promo-heading__title",
      },
      return: { attributes: ["text"], nth: "*" },
    },
  ],
}).then((results) => results.map((res) => console.log(res)));


