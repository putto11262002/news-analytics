import axios from "axios";
import cheerio, { CheerioAPI } from "cheerio";

const fetchHtml = async (pageUrl: string) => {
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

const getElBySelectorAndClassRegex = ($: CheerioAPI, spec: IElSpec) => {
  // apply selector
  var elMatchedSelector = $(spec.target.selector).toArray();
  var els: any[] = [];

  for (let i = 0; i < elMatchedSelector.length; i++) {
    if (spec.return.nth !== "*" && i >= spec.return.nth) break;

    let el = elMatchedSelector[i];
    // let elClass = $(el).attr("class") || "";

    els.push(el);
  }

  return els;
};

export interface IElTarget {
  selector: string;
  // classRegex: RegExp;
}

export type ReturnAttributes = "href" | "text" | "class";

export interface IElRetrun {
  nth: number | "*";
  attributes: ReturnAttributes[];
}
export interface IElSpec {
  key: string;
  return: IElRetrun;
  target: IElTarget;
}

export interface IScaperV1Config {
  url: string;
  elSpecs: IElSpec[];
}

const scraperV1 = async (config: IScaperV1Config) => {
  const html = await fetchHtml(config.url);
  const $ = cheerio.load(html);
  const results: any[] = [];

  for (let elSpec of config.elSpecs) {
    let els = getElBySelectorAndClassRegex($, elSpec);

    let returnValues: { [key: string]: undefined | string }[] = [];
    els.forEach((el) => {

      let returnValue: { [key: string]: undefined | string } = {};

      elSpec.return.attributes.forEach((attr) => {

        let attrValue = undefined;

        switch (attr) {
          case "class":
          case "href":
            let href = $(el).attr(attr);
            attrValue = href ? addBaseURLToLink(href, config.url) : undefined;
            break;
          case "text":
            attrValue = $(el).text();
            break;
        }

        returnValue[attr] = attrValue;

      });

      returnValues.push(returnValue);

    });

    results.push({ spec: elSpec, results: returnValues });
  }


  return results;

};

export default scraperV1;
