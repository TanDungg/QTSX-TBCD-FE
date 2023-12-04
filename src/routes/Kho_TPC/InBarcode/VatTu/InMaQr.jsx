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
          return (
            <Col
              key={index}
              className={"print-page"}
              style={{
                width: "180px",
                height: "100px",
                margin: 10,
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
                  width: "30%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginLeft: 8,
                }}
              >
                <QRCode
                  value={
                    d && d.vatTu_Id + (d.hanSuDung ? "_" + d.hanSuDung : "")
                  }
                  style={{ width: 55, height: 55 }}
                />
                <span style={{ fontSize: 10, fontWeight: "bold" }}>
                  {d && d.hanSuDung}
                </span>
              </div>
              <div
                style={{
                  width: "70%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  margin: "0px 5px",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    whiteSpace: "break-spaces",
                    wordBreak: "break-all",
                    marginBottom: 2,
                  }}
                >
                  {d && d.maVatTu}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {d && d.tenVatTu}
                </span>
              </div>
            </Col>
          );
        })}
    </Row>
  );
}

export default InMaQr;
