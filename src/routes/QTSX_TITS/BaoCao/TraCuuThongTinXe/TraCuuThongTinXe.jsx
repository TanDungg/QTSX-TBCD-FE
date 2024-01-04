import React, { useEffect, useState } from "react";
import { Card, Row, Col, Input, Button, Image } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import {
  convertObjectToUrlParams,
  getLocalStorage,
  getTokenInfo,
} from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";

function TraCuuThongTinXe({ history, permission }) {
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const INFO = { ...getLocalStorage("menu"), user_Id: getTokenInfo().id };
  const [keyword, setKeyword] = useState("");
  const [Data, setData] = useState(null);

  useEffect(() => {
    if (permission && permission.view) {
      getListData(keyword);
    } else if ((permission && !permission.view) || permission === undefined) {
      history.push("/home");
    }

    return () => dispatch(fetchReset());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListData = (keyword) => {
    const param = convertObjectToUrlParams({
      keyword,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_BaoCao/tra-cuu-thong-tin-xe?${param}`,
          "GET",
          null,
          "LIST",
          "",
          resolve,
          reject
        )
      );
    })
      .then((res) => {
        if (res && res.data) {
          setData(res.data);
        } else {
          setData(null);
        }
      })
      .catch((error) => console.error(error));
  };

  const onSearchThongTinXe = () => {
    getListData(keyword);
  };

  const onChangeKeyword = (val) => {
    console.log(val.target.value);
    setKeyword(val.target.value);
  };

  return (
    <div className="gx-main-content">
      <ContainerHeader
        title="Tra cứu thông tin xe"
        description="Tra cứu thông tin xe"
      />

      <Card className="th-card-margin-bottom th-card-reset-margin">
        <Row
          align="center"
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Input
            placeholder="Nhập số khung xe"
            value={keyword}
            style={{ marginRight: "20px", width: "350px" }}
            onChange={(value) => onChangeKeyword(value)}
          />
          <Button
            style={{ height: "35px !important" }}
            className="th-margin-bottom-0"
            type="primary"
            onClick={onSearchThongTinXe}
          >
            Tìm kiếm
          </Button>
        </Row>
      </Card>
      {Data && (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row
            style={{
              padding: "0px 50px",
            }}
          >
            <Col lg={12} xs={24}>
              <Row>
                <Col
                  span={24}
                  style={{
                    marginBottom: 10,
                  }}
                >
                  <h4
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    {Data.tenSanPham} ({Data.maNoiBo})
                  </h4>
                </Col>
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 15,
                  }}
                >
                  <span
                    style={{
                      width: "100px",
                      fontWeight: "bold",
                    }}
                  >
                    Loại xe:
                  </span>
                  {Data && (
                    <span
                      style={{
                        width: "calc(100% - 100px)",
                      }}
                    >
                      {Data.tenLoaiSanPham}
                    </span>
                  )}
                </Col>
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 15,
                  }}
                >
                  <span
                    style={{
                      width: "100px",
                      fontWeight: "bold",
                    }}
                  >
                    Màu sắc:
                  </span>
                  <span
                    style={{
                      width: "calc(100% - 100px)",
                    }}
                  >
                    {Data.tenMauSac}
                  </span>
                </Col>
                <Col
                  span={24}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 15,
                  }}
                >
                  <span
                    style={{
                      width: "180px",
                      fontWeight: "bold",
                    }}
                  >
                    Ngày kích hoạt bảo hành:
                  </span>
                  {Data && (
                    <span
                      style={{
                        width: "calc(100% - 180px)",
                      }}
                    >
                      {Data.ngayXuatXuong}
                    </span>
                  )}
                </Col>
              </Row>
            </Col>
            <Col lg={12} xs={24}>
              <Image
                src={BASE_URL_API + Data.hinhAnh}
                alt="Hình ảnh"
                style={{ maxWidth: "100%", maxHeight: "120px" }}
              />
            </Col>
          </Row>
        </Card>
      )}
      {Data && (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <Row
            style={{
              padding: "0px 50px ",
              marginBottom: "20px",
            }}
          >
            <Col
              span={24}
              style={{
                marginBottom: 10,
              }}
            >
              <h4
                style={{
                  fontWeight: "bold",
                }}
              >
                Lịch sử sản xuất
              </h4>
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <span
                style={{
                  width: "100px",
                  fontWeight: "bold",
                }}
              >
                Đơn hàng:
              </span>
              {Data && (
                <span
                  style={{
                    width: "calc(100% - 100px)",
                  }}
                >
                  {Data.tenDonHang}
                </span>
              )}
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <span
                style={{
                  width: "150px",
                  fontWeight: "bold",
                }}
              >
                Ngày xuất xưởng:
              </span>
              <span
                style={{
                  width: "calc(100% - 150px)",
                }}
              >
                {Data.ngayXuatXuong}
              </span>
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <span
                style={{
                  width: "100px",
                  fontWeight: "bold",
                }}
              >
                Số lô:
              </span>
              <span
                style={{
                  width: "calc(100% - 100px)",
                }}
              >
                {Data.maSoLo}
              </span>
            </Col>
            <Col
              lg={12}
              xs={24}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <span
                style={{
                  width: "150px",
                  fontWeight: "bold",
                }}
              >
                Ngày bàn giao:
              </span>
              <span
                style={{
                  width: "calc(100% - 150px)",
                }}
              >
                {Data.ngayBanGiao}
              </span>
            </Col>
          </Row>
          <Row
            style={{
              padding: "0px 50px",
            }}
          >
            {Data.list_CongDoans &&
              Data.list_CongDoans.map((congdoan) => {
                return (
                  <Col
                    lg={12}
                    xs={24}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 15,
                    }}
                  >
                    <span
                      style={{
                        width: "150px",
                        fontWeight: "bold",
                      }}
                    >
                      {congdoan.tenCongDoan}
                    </span>
                    <div
                      style={{
                        width: "calc(100% - 150px)",
                        alignItems: "start",
                      }}
                    >
                      <span
                        style={{
                          border: "1px solid #c8c8c8",
                        }}
                      >
                        {congdoan.thoiGianVaoCongDoan}
                      </span>
                      <span
                        style={{
                          border: "1px solid #c8c8c8",
                        }}
                      >
                        {congdoan.thoiGianRaCongDoan}
                      </span>
                    </div>
                  </Col>
                );
              })}
          </Row>
        </Card>
      )}
    </div>
  );
}

export default TraCuuThongTinXe;
