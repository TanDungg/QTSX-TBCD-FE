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
    <Row justify={"center"} style={{ width: "100%" }}>
      {listVatTu &&
        listVatTu.map((d, index) => {
          return (
            <Col
              key={index}
              className={"print-page"}
              style={{
                width: "45mm",
                height: "20mm",
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
                  marginLeft: 5,
                }}
              >
                <QRCode
                  value={d && d.id}
                  style={{ width: 50, height: 50, marginBottom: 3 }}
                />
              </div>
              <div
                style={{
                  width: "70%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  marginLeft: 5,
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    whiteSpace: "break-spaces",
                    wordBreak: "break-all",
                    padding: "0px 5px",
                    marginBottom: 2,
                  }}
                >
                  {d && d.maSanPham}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: "bold",
                    marginBottom: 2,
                    textTransform: "uppercase",
                  }}
                >
                  {d && d.tenSanPham}
                </span>
                {/* <span
                  style={{
                    fontSize: 9,
                    whiteSpace: "break-spaces",
                    wordBreak: "break-all",
                    padding: "0px 5px",
                    marginBottom: 2,
                  }}
                >
                  {d && d.tenMauSac}
                </span> */}
              </div>
            </Col>
          );
        })}
    </Row>
  );
}

export default InMaQr;