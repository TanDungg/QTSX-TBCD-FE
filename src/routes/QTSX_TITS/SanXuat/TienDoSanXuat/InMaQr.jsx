import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import QRCode from "qrcode.react";
import { useHistory } from "react-router-dom";
import { getLocalStorage } from "src/util/Common";

function InMaQr() {
  let history = useHistory();
  const data = getLocalStorage("inMa");
  const [listVatTu, setListVatTu] = useState([]);
  useEffect(() => {
    if (data && data.length > 0) {
      setListVatTu(data);
    } else {
      setListVatTu([]);
      history.push("/home");
    }
  }, []);

  return (
    <Row justify={"center"}>
      {listVatTu &&
        listVatTu.map((d, index) => {
          const item = listVatTu.length === 1;
          return (
            <Col
              key={index}
              className={"print-page"}
              style={{
                width: item ? "160px" : "170px",
                height: item ? "94px" : "104px",
                margin: 2,
                border: "1px solid #000",
                borderRadius: 5,
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "35%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginLeft: 8,
                }}
              >
                <QRCode
                  value={d && d.soKhungNoiBo}
                  style={{ width: 65, height: 65, marginBottom: 2 }}
                />
                {/* <span style={{ fontSize: 9, fontWeight: "bold" }}>
                  {d && d.hanSuDung}
                </span> */}
              </div>
              <div
                style={{
                  width: "65%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  margin: "0px 8px",
                }}
              >
                <span
                  style={{
                    fontSize: 8,
                    whiteSpace: "break-spaces",
                    wordBreak: "break-all",
                    marginBottom: 2,
                  }}
                >
                  {d && d.tenSanPham}
                </span>
                {/* <span
                  style={{
                    fontSize: 8,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {d && d.tenVatTu}
                </span> */}
              </div>
            </Col>
          );
        })}
    </Row>
  );
}

export default InMaQr;
