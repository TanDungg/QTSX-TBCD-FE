import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import QRCode from "qrcode.react";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { useDispatch, useSelector } from "react-redux";

function InMaQr() {
  const qrCodeVatTu = localStorage ? JSON.parse(localStorage.qrCodeVatTu) : [];
  const dispatch = useDispatch();
  const [listVatTu, setListVatTu] = useState([]);
  useEffect(() => {
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `lkn_mobile/get-qrcode-mobile-list-vat-tu?id=${qrCodeVatTu.info.id}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setListVatTu(res.data);
        } else {
          setListVatTu([]);
        }
      })
      .catch((error) => console.error(error));
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
                  marginTop: 10,
                  marginLeft: 8,
                }}
              >
                <QRCode
                  value={d && d.qrcode}
                  style={{ width: 60, height: 60, marginBottom: 3 }}
                />
                <span style={{ fontSize: 12, fontWeight: "bold" }}>
                  {d && d.thoiGianSuDung}
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
                    fontSize: 12,
                    whiteSpace: "break-spaces",
                    wordBreak: "break-all",
                    padding: "0px 5px",
                    marginBottom: 2,
                  }}
                >
                  {d && d.maVatTu}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: "bold",
                    marginBottom: 2,
                  }}
                >
                  {d && d.tenVatTu}
                </span>
              </div>
            </Col>
          );
        })}
    </Row>
  );
}

export default InMaQr;
