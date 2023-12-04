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
                {/* <span
                  style={{ fontSize: 10, fontWeight: "bold", marginBottom: 3 }}
                >
                  Vị trí kho:
                </span> */}
                <QRCode value={d && d.id} style={{ width: 55, height: 55 }} />
                {/* <span style={{ fontSize: 11, fontWeight: "bold" }}>
                <span style={{ fontSize: 10, fontWeight: "bold" }}>
                  Vị trí kho:
                </span>
                <QRCode value={d && d.id} style={{ width: 60, height: 60 }} />
                <span style={{ fontSize: 11, fontWeight: "bold" }}>
                  {d && d.stt}
                </span> */}
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
                {/* <span
                  style={{
                    fontSize: 12,
                    whiteSpace: "break-spaces",
                    wordBreak: "break-all",
                  }}
                >
                  {d && d.maCauTrucKho}
                </span> */}
                <span
                  style={{
                    fontSize: 11,
                    marginBottom: 2,
                  }}
                >
                  {d && d.tenCauTrucKho}
                </span>
                <span
                  style={{
                    fontSize: 12,
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
