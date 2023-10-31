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
  console.log(CauTrucKho);

  return (
    <Row justify={"center"} style={{ width: "100%" }}>
      {CauTrucKho &&
        CauTrucKho.map((d, index) => {
          return (
            <Col
              key={index}
              className={"print-page"}
              style={{
                width: "220px",
                height: "120px",
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
                  marginTop: 5,
                  marginLeft: 8,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: "bold" }}>
                  Vị trí kho:
                </span>
                <QRCode
                  value={d && d.id}
                  style={{ width: 70, height: 70, marginBottom: 3 }}
                />
                <span style={{ fontSize: 13, fontWeight: "bold" }}>
                  {d && d.stt}
                </span>
              </div>
              <div
                style={{
                  width: "70%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  marginLeft: "5px",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    whiteSpace: "break-spaces",
                    wordBreak: "break-all",
                    padding: "0px 5px",
                    marginBottom: 2,
                  }}
                >
                  {d && d.maCauTrucKho}
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: "bold",
                    margin: 2,
                    whiteSpace: "break-spaces",
                    wordBreak: "break-all",
                  }}
                >
                  {d && d.tenCauTrucKho}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: "bold",
                    marginBottom: 2,
                    whiteSpace: "break-spaces",
                    wordBreak: "break-all",
                  }}
                >
                  {d && d.tenPhongBan}
                </span>
              </div>
            </Col>
            // <Col className="inMa-BarCode" style={{ width: 114, height: 152 }}>
            //   <QRCode
            //     value={d && d.id}
            //     style={{ marginTop: 7, width: 100, height: 100 }}
            //   />
            //   <p
            //     style={{
            //       fontSize: 11,
            //       margin: 0,
            //       color: "black",
            //       fontWeight: "bold",
            //       whiteSpace: "break-spaces",
            //       wordBreak: "break-all",
            //     }}
            //   >
            //     {d && d.maKe ? d.maKe : d.maCauTrucKho}
            //   </p>
            // </Col>
          );
        })}
    </Row>
  );
}

export default InMaQr;
