import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import QRCode from "qrcode.react";
import { useHistory } from "react-router-dom";
import { getLocalStorage } from "src/util/Common";
function InMaQrSoVIN() {
  const data = getLocalStorage("inMa");
  let history = useHistory();
  const [SoVIN, setSoVIN] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setSoVIN(data);
    } else {
      setSoVIN([]);
      history.push("/home");
    }
  }, []);

  return (
    <Row justify={"center"}>
      {SoVIN &&
        SoVIN.map((d, index) => {
          const item = SoVIN.length === 1;
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
                  width: "40%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginLeft: 5,
                }}
              >
                <QRCode
                  value={d && d.maSoVin}
                  style={{ width: 65, height: 65 }}
                />
              </div>
              <div
                style={{
                  width: "60%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  margin: "0px 5px",
                }}
              >
                <span
                  style={{
                    fontSize: 8,
                    marginBottom: 2,
                  }}
                >
                  {d && d.maSoVin}
                </span>
                {/* <span
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {d && d.tenPhongBan}
                </span> */}
              </div>
            </Col>
          );
        })}
    </Row>
  );
}

export default InMaQrSoVIN;
