import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import QRCode from "qrcode.react";
import { useHistory } from "react-router-dom";
import { getLocalStorage } from "src/util/Common";
function InMaQrSoContainer() {
  const data = getLocalStorage("maQrCodeSoContainer");
  let history = useHistory();
  const [ListSoContainer, setListSoContainer] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setListSoContainer(data);
    } else {
      setListSoContainer([]);
      history.push("/home");
    }
  }, []);

  return (
    <Row justify={"center"}>
      {ListSoContainer &&
        ListSoContainer.map((d, index) => {
          const item = ListSoContainer.length === 1;
          return (
            <Col
              key={index}
              className={"print-page"}
              style={{
                // width: item ? "160px" : "170px",
                // height: item ? "94px" : "104px",
                width: "170px",
                height: "104px",
                border: "1px solid #000",
                borderRadius: 5,
                margin: 2,
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
                <QRCode value={d && d.id} style={{ width: 50, height: 50 }} />
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
                    fontSize: 9,
                    marginBottom: 2,
                  }}
                >
                  {d && d.soContainer}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {d && d.soSeal}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {d && d.dimensions}
                </span>
              </div>
            </Col>
          );
        })}
    </Row>
  );
}

export default InMaQrSoContainer;
