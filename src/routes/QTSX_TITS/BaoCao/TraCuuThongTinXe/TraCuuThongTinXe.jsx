import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Image,
  Modal as AntModal,
  Divider,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchStart, fetchReset } from "src/appRedux/actions/Common";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import ContainerHeader from "src/components/ContainerHeader";
import { BASE_URL_API } from "src/constants/Config";
import { LeftCircleOutlined, RightCircleOutlined } from "@ant-design/icons";
import { EditableTableRow, Table } from "src/components/Common";
import { map } from "lodash";

const { EditableRow, EditableCell } = EditableTableRow;

function TraCuuThongTinXe({ history, permission }) {
  const { loading, width } = useSelector(({ common }) => common).toJS();
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState("");
  const [Data, setData] = useState(null);
  const [DataHoSoChatLuong, setDataHoSoChatLuong] = useState(null);
  const [DisabledModalHoSoChatLuong, setDisabledModalHoSoChatLuong] =
    useState(false);

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
          const DataVatTu = res.data.list_VatTuLapRaps.reduce(
            (result, item) => {
              const vattu = result.find(
                (group) => group.tenLoaiVatTu === item.tenLoaiVatTu
              );

              if (vattu) {
                vattu.list_VatTu.push({
                  tits_qtsx_TienDoSanXuat_Id: item.tits_qtsx_TienDoSanXuat_Id,
                  maVatTu: item.maVatTu,
                  tenVatTu: item.tenVatTu,
                  maHopDong: item.maHopDong,
                  ngayNhapKho: item.ngayNhapKho,
                  tenNguoiNhap: item.tenNguoiNhap,
                });
              } else {
                result.push({
                  tenLoaiVatTu: item.tenLoaiVatTu,
                  list_VatTu: [
                    {
                      tits_qtsx_TienDoSanXuat_Id:
                        item.tits_qtsx_TienDoSanXuat_Id,
                      maVatTu: item.maVatTu,
                      tenVatTu: item.tenVatTu,
                      maHopDong: item.maHopDong,
                      ngayNhapKho: item.ngayNhapKho,
                      tenNguoiNhap: item.tenNguoiNhap,
                    },
                  ],
                });
              }

              return result;
            },
            []
          );
          const newData = {
            ...res.data,
            list_VatTuLapRaps: DataVatTu,
          };
          setData(newData);
          newData.list_HoSoKiemTraChatLuongs &&
            setDataHoSoChatLuong(newData.list_HoSoKiemTraChatLuongs);
        } else {
          setData(null);
        }
      })
      .catch((error) => console.error(error));
  };

  let colChiTiet = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 45,
    },
    {
      title: "Công đoạn",
      dataIndex: "tenCongDoan",
      key: "tenCongDoan",
      align: "center",
    },
    {
      title: "Trạm kiểm tra",
      dataIndex: "tenTram",
      key: "tenTram",
      align: "center",
    },
    {
      title: "Thời gian kiểm tra",
      dataIndex: "thoiGianKiemTra",
      key: "thoiGianKiemTra",
      align: "center",
    },
    {
      title: "Hồ sơ",
      dataIndex: "hoSo",
      key: "hoSo",
      align: "center",
    },
  ];

  const componentschitiet = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columnschitiet = map(colChiTiet, (col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        info: col.info,
      }),
    };
  });

  const onSearchThongTinXe = () => {
    getListData(keyword);
  };

  const onChangeKeyword = (val) => {
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
                    marginBottom: 10,
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
                    marginBottom: 10,
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
                    marginBottom: 10,
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
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: "140px",
                  fontWeight: "bold",
                }}
              >
                Đơn hàng:
              </span>
              {Data && (
                <span
                  style={{
                    width: "calc(100% - 140px)",
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
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: "140px",
                  fontWeight: "bold",
                }}
              >
                Ngày xuất xưởng:
              </span>
              <span
                style={{
                  width: "calc(100% - 140px)",
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
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: "140px",
                  fontWeight: "bold",
                }}
              >
                Số lô:
              </span>
              <span
                style={{
                  width: "calc(100% - 140px)",
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
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: "140px",
                  fontWeight: "bold",
                }}
              >
                Ngày bàn giao:
              </span>
              <span
                style={{
                  width: "calc(100% - 140px)",
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
                      marginBottom: 10,
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
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <span
                        style={{
                          borderBottom: "2px solid #c8c8c8",
                          borderLeft: "2px solid #c8c8c8",
                          display: "block",
                          boxSizing: "border-box",
                          padding: "5px",
                        }}
                      >
                        <RightCircleOutlined
                          style={{
                            color: "#0469B9",
                          }}
                        />{" "}
                        {congdoan.thoiGianVaoCongDoan}
                      </span>
                      <span
                        style={{
                          borderLeft: "2px solid #c8c8c8",
                          display: "block",
                          boxSizing: "border-box",
                          padding: "5px",
                        }}
                      >
                        <LeftCircleOutlined
                          style={{
                            color: "#0469B9",
                          }}
                        />{" "}
                        {congdoan.thoiGianRaCongDoan}
                      </span>
                    </div>
                  </Col>
                );
              })}
          </Row>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "0px 50px",
            }}
          >
            <a
              onClick={() => setDisabledModalHoSoChatLuong(true)}
              style={{ fontWeight: "bold" }}
            >
              Xem hồ sơ kiểm tra chất lượng
            </a>
          </div>
        </Card>
      )}
      {Data && (
        <Card className="th-card-margin-bottom th-card-reset-margin">
          <div
            style={{
              padding: "0px 50px ",
            }}
          >
            <Row
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
                Thông tin vật tư
              </h4>
            </Row>
            <Row span={24}>
              {Data.list_VatTuLapRaps &&
                Data.list_VatTuLapRaps.map((chitiet, index) => {
                  return (
                    <>
                      <Col
                        lg={12}
                        xs={24}
                        key={index}
                        style={{
                          borderRight:
                            index % 2 === 0 ? "2px solid #c8c8c8" : "",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{
                              color: "#0469B9",
                              fontWeight: "bold",
                            }}
                          >
                            {chitiet.tenLoaiVatTu}
                          </span>
                        </div>
                        <Divider style={{ marginBottom: "10px" }} />
                        {chitiet.list_VatTu &&
                          chitiet.list_VatTu.map((vattu, index) => {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  marginBottom: "15px",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: "bold",
                                    marginRight: "5px",
                                  }}
                                >
                                  {index + 1}.
                                </span>
                                <Row>
                                  <Col
                                    span={24}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      marginBottom: 10,
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: "140px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      Tên vật tư:
                                    </span>
                                    <span
                                      style={{
                                        width: "calc(100% - 140px)",
                                      }}
                                    >
                                      {vattu.tenVatTu}
                                    </span>
                                  </Col>
                                  <Col
                                    span={24}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      marginBottom: 10,
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: "140px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      Mã hợp đồng:
                                    </span>
                                    <span
                                      style={{
                                        width: "calc(100% - 140px)",
                                      }}
                                    >
                                      {vattu.maHopDong && vattu.maHopDong}
                                    </span>
                                  </Col>
                                  <Col
                                    span={24}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      marginBottom: 10,
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: "140px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      Nhập kho:
                                    </span>
                                    <span
                                      style={{
                                        width: "calc(100% - 140px)",
                                      }}
                                    >
                                      {vattu.ngayNhapKho && vattu.ngayNhapKho}
                                    </span>
                                  </Col>
                                  <Col
                                    span={24}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      marginBottom: 10,
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: "140px",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      Người nhập kho:
                                    </span>
                                    <span
                                      style={{
                                        width: "calc(100% - 140px)",
                                      }}
                                    >
                                      {vattu.tenNguoiNhap && vattu.tenNguoiNhap}
                                    </span>
                                  </Col>
                                </Row>
                              </div>
                            );
                          })}
                      </Col>
                    </>
                  );
                })}
            </Row>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <a
                onClick={() => setDisabledModalHoSoChatLuong(true)}
                style={{ fontWeight: "bold" }}
              >
                Xem thông tin hồ sơ chi tiết
              </a>
            </div>
          </div>
        </Card>
      )}
      <AntModal
        title={"Hồ sơ kiểm tra chất lượng"}
        className="th-card-reset-margin"
        open={DisabledModalHoSoChatLuong}
        width={"80%"}
        closable={true}
        onCancel={() => setDisabledModalHoSoChatLuong(false)}
        footer={null}
      >
        <Table
          bordered
          columns={columnschitiet}
          components={componentschitiet}
          scroll={{ x: 1200, y: "40vh" }}
          className="gx-table-responsive"
          dataSource={reDataForTable(DataHoSoChatLuong)}
          size="small"
          loading={loading}
          pagination={false}
        />
      </AntModal>
    </div>
  );
}

export default TraCuuThongTinXe;
