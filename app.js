const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const axios = require("axios");

// test
const Crawling = async () => {
  try {
    await axios.get("https://daily-coding-diary.tistory.com/").then((res) => {
      const $ = cheerio.load(res.data);
      const elements = $("section .post h2");
      elements.each((idx, el) => {
        console.log($(el).text());
      });
    });
  } catch (error) {
    console.log(error);
  }
};

// 롯데택배
const LotteDelivery = async (waybill) => {
  try {
    await axios
      .get(
        `https://www.lotteglogis.com/mobile/reservation/tracking/linkView?InvNo=${waybill}`
      )
      .then((res) => {
        const $ = cheerio.load(res.data);
        const elements = $(".data_table td");
        elements.each((idx, el) => {
          console.log($(el).text());
        });
      });
  } catch (error) {
    console.log(error);
  }
};

// 대한통운
const CjDelivery = async (waybill) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.cjlogistics.com/ko/tool/parcel/tracking");
    await page.click(
      "body div.parcel-search div.box-numberInfo div.common-srcBox-1 div.inputSrc-1 input"
    );
    await page.evaluate((id) => {
      document.querySelector("#paramInvcNo").value = id;
    }, waybill);
    await page.click(
      ".parcel-search .common-srcBox-1 .btnSrc-1, .parcel-search .common-srcBox-1 .btnSrc-1 .icon-search input"
    );

    const content = await page.content();
    const $ = cheerio.load(content);
    const result_th = $(".common-hrTable-1:nth-of-type(1) table tr th");
    const result_td = $(".common-hrTable-1:nth-of-type(1) table tr td");
    const check_th = $(".common-hrTable-1:nth-of-type(2) table tr th");
    const check_td = $(".common-hrTable-1:nth-of-type(2) table tr td");

    let result_obj = {};
    let result_th_arr = [];
    result_th.each((idx, el) => {
      let test = $(el).text().replace("\n\t\t\t\t\t\t ", ",");
      result_th_arr.push(test);
    });
    let result_td_arr = [];
    result_td.each((idx, el) => {
      let test = $(el).text().replace("\n\t\t\t\t\t\t ", ",");
      result_td_arr.push(test);
    });

    for (let i = 0; i < result_th_arr.length; i++) {
      result_obj[result_th_arr[i]] = result_td_arr[i];
    }

    let check_arr = [];
    let check_obj = {};

    let check_th_arr = [];
    check_th.each((idx, el) => {
      let test = $(el).text().replace("\n\t\t\t\t\t\t ", ",");
      check_th_arr.push(test);
    });
    let check_td_arr = [];
    check_td.each((idx, el) => {
      let test = $(el).text().replace("\n\t\t\t\t\t\t ", ",");
      check_td_arr.push(test);
    });

    for (let i = 0; i < check_td_arr.length; i++) {
      let count = i % 4;
      if (i < check_th_arr.length) {
        check_obj[check_th_arr[i]] = check_td_arr[i];
      } else {
        check_obj[check_th_arr[count]] = check_td_arr[i];
      }
      if (count == 3) {
        check_arr.push(check_obj);
        check_obj = {};
      }
    }
    await browser.close();
    return check_arr;
  } catch (error) {}
};

// Crawling();
// LotteDelivery();
// CjDelivery().then((res) => console.log(res));

console.log("server start");
