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
                width: "170px",
                height: "104px",
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
                <QRCode value={d && d.id} style={{ width: 55, height: 55 }} />
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
                  {d && d.maSanPham}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
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
