import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import QRCode from "qrcode.react";
import { useLocation, useHistory } from "react-router-dom";
function InMaQr() {
  const location = useLocation();
  let history = useHistory();
  const [ThongTinVatTu, setThongTinVatTu] = useState([]);
  useEffect(() => {
    if (location.state && location.state.thongTinVatTu) {
      setThongTinVatTu(location.state.thongTinVatTu);
    } else {
      history.push("/home");
    }
  }, []);
  return (
    <Row justify={"center"} style={{ width: "100%" }}>
      {ThongTinVatTu.map((d) => {
        return (
          <Col>
            <div
              style={{
                width: 114,
                height: 152,
                border: "1px solid #333",
                margin: 12,
                marginLeft: 5,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 5, margin: "3px 0", color: "red" }}>
                {d && d.thongTinVatTu_Id}
              </p>
              <QRCode
                value={d && d.thongTinVatTu_Id}
                style={{ width: 100, height: 100 }}
              />
              <p style={{ fontSize: 8, margin: 0, color: "red" }}>
                {d && d.tenVatTu}
              </p>
            </div>
          </Col>
        );
      })}
    </Row>
  );
}

export default InMaQr;
