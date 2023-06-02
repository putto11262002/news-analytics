import { run } from "./runner/scape-headline-news.runner/v1";
run({
    homePage: {
        url: "https://www.bbc.com/news",
        link: {selector: ".nw-c-top-stories__secondary-item a.gs-c-promo-heading, .nw-c-top-stories-primary__story a.gs-c-promo-heading", attr: "attr:href"}
        
    },
    newsPage: {
        title: {selector: "#main-heading", attr: "text"},
        content: {selector: "[data-component='text-block'] p.ssrcss-1q0x1qg-Paragraph", attr: "text"},
        timestamp: {selector: ".ssrcss-m5j4pi-MetadataContent time", attr: "attr:datetime"}
    }
}).then(res => console.log(res))