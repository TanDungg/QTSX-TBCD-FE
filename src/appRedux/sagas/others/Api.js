import apiCaller from "src/util/apiCaller";

const fetchData = function* fetchData(urlData, method, value, upload) {
  let data = apiCaller(urlData, method, value, "", upload);
  return yield data ? data : [];
};
export default fetchData;
