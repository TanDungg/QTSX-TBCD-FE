import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import QRCode from "qrcode.react";
import { useLocation, useHistory } from "react-router-dom";
function InMaQr() {
  const location = useLocation();
  let history = useHistory();
  const [CauTrucKho, setCauTrucKho] = useState([]);
  const [Ke, setKe] = useState(false);
  useEffect(() => {
    if (location.state && location.state.CauTrucKho) {
      setCauTrucKho(location.state.CauTrucKho);
    } else if (location.state && location.state.Ke) {
      console.log(location.state.Ke);
      setKe(true);
      setCauTrucKho(location.state.Ke);
    } else {
      history.push("/home");
    }
  }, []);
  return (
    <Row justify={"center"} style={{ width: "100%" }}>
      {CauTrucKho.map((d) => {
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
                {d && d.id}
              </p>
              <QRCode value={d && d.id} style={{ width: 100, height: 100 }} />
              <p style={{ fontSize: 8, margin: 0, color: "red" }}>
                {d && Ke ? d.maKe : d.maCauTrucKho}
              </p>
            </div>
          </Col>
        );
      })}
    </Row>
  );
}

export default InMaQr;
