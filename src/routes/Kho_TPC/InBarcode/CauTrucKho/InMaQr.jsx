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
    <Row justify={"center"} style={{ width: "100%" }}>
      {CauTrucKho.map((d) => {
        return (
          <Col className="inMa-BarCode" style={{ width: 114, height: 152 }}>
            <QRCode
              value={d && d.id}
              style={{ marginTop: 7, width: 100, height: 100 }}
            />
            <p
              style={{
                fontSize: 11,
                margin: 0,
                color: "black",
                fontWeight: "bold",
                whiteSpace: "break-spaces",
                wordBreak: "break-all",
              }}
            >
              {d && d.maKe ? d.maKe : d.maCauTrucKho}
            </p>
          </Col>
        );
      })}
    </Row>
  );
}

export default InMaQr;
