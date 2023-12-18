import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import QRCode from "qrcode.react";
import { useHistory } from "react-router-dom";
import { getLocalStorage } from "src/util/Common";
function InMaQr() {
  const data = getLocalStorage("inMa");
  let history = useHistory();
  const [CauTrucKho, setCauTrucKho] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setCauTrucKho(data);
    } else {
      setCauTrucKho([]);
      history.push("/home");
    }
  }, []);

  return (
    <Row justify={"center"}>
      {CauTrucKho &&
        CauTrucKho.map((d, index) => {
          const item = CauTrucKho.length === 1;
          return (
            <Col
              key={index}
              className={"print-page"}
              style={{
                width: item ? "160px" : "170px",
                height: item ? "94px" : "104px",
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
                  width: "35%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginLeft: 8,
                }}
              >
                <QRCode value={d && d.id} style={{ width: 65, height: 65 }} />
              </div>
              <div
                style={{
                  width: "65%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  margin: "0px 5px",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    marginBottom: 2,
                  }}
                >
                  {d && d.tenCauTrucKho}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {d && d.tenPhongBan}
                </span>
              </div>
            </Col>
          );
        })}
    </Row>
  );
}

export default InMaQr;
