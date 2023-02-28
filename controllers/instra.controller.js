const axios = require("axios");

const TOKEN =
  "EAAU579TDpf0BAFG4WOQynYwaLZAWUO0TZB6PnkQbPg8M9fDsr79Lsmg4sOdoddBhMSCE41pZCKgd1oHbhoY6Uva6ZCkySsR6ZA39TZAygHJFd0J6zeTSXKVLjzo8CgkIJeWHdqgvcZCYYCi8ZB9euZAG9wSyZB1viaTP6pzr5ngPKjkbZAHleJ6kbbujU6Qdhjx2FirIcJPf2A6dFBgiu7CuzNmDU5kcOkXOwjVoklZA51y19AOaI6iTOWuNSh7owi3jjup48zeXLiU1FMZAbAEgdzAqW";

const limit = 100;
const postAPI = `https://graph.facebook.com/me/accounts?fields=instagram_business_account,global_brand_page_name&limit=${limit}&access_token=${TOKEN}`;

// {"method":"GET", "relative_url":"17841441669193838/content_publishing_limit"}, {"method":"GET", "relative_url":"17841455471070276/content_publishing_limit"}
exports.fetchId = async (ctx) => {
  try {
    const res = await axios.get(postAPI);

    // filter & store the instagram_business_account id & pageName
    const myData = res.data.data
      .filter((ele) => {
        const id = ele?.instagram_business_account?.id;
        const pageName = ele?.global_brand_page_name;

        if (!id || !pageName) return false;
        return true;
      })
      .map((ele) => {
        const id = ele?.instagram_business_account?.id;
        const pageName = ele?.global_brand_page_name;
        return {
          id,
          pageName,
        };
      });

    const pageId_pageName = myData;
    const ids = [];
    for (let ele of myData) {
      ids.push({
        method: "GET",
        relative_url: `${ele.id}/content_publishing_limit`,
      });
    }

    // const batchAPI = `https://graph.facebook.com/me?batch=${JSON.stringify(
    //   ids
    // )}&include_headers=false&access_token=${TOKEN}`;
    // const batchResponce = await axios.post(batchAPI);

    // It will return URL for different instagram_business_accounts
    const batchAPIFunc = (ids) => {
      return `https://graph.facebook.com/me?batch=${JSON.stringify(
        ids
      )}&include_headers=false&access_token=${TOKEN}`;
    };

    const idsArr = [];
    const promises = [];

    // split array in chunck of arrSize
    const arrSize = 50;
    for (let i = 0; i < ids.length; i += arrSize) {
      const arr = ids.slice(i, i + arrSize);
      idsArr.push(arr);
      promises.push(axios.post(batchAPIFunc(arr)));
    }

    const fetchBusinessAccountData = async () => {
      let data = await Promise.all(promises);
      let res = [];
      for (let p of data) {
        res.push(...p.data);
      }
      return res;
    };

    console.time("time");
    const batchData = await fetchBusinessAccountData();
    console.timeEnd("time");

    // batch API
    // const batchData = batchResponce.data;
    // console.log("batchData->", batchData);

    const responce = [];
    let totalErrorAccounts = 0;
    for (let idx = 0; idx < batchData.length; idx++) {
      const obj1 = pageId_pageName[idx];
      const obj2 = batchData[idx];

      obj2.body = JSON.parse(obj2.body);

      totalErrorAccounts += obj2?.body?.error?.code === 10;

      responce.push({ ...obj1, ...obj2 });
    }

    ctx.status = 200;
    ctx.body = {
      totalAccounts: pageId_pageName.length,
      totalErrorAccounts,
      data: responce,
    };
  } catch (error) {
    ctx.status = 400;
    ctx.body = error.message;
  }
};
