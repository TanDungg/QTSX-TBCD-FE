import { Modal as AntModal, Row, Col, Tag, Divider } from "antd";
import { map } from "lodash";
import React, { useEffect, useState } from "react";
import {
  useDispatch,
  //  useSelector
} from "react-redux";
import { fetchReset, fetchStart } from "src/appRedux/actions";
import { Table, EditableTableRow } from "src/components/Common";
import { BASE_URL_API } from "src/constants/Config";
import { convertObjectToUrlParams, reDataForTable } from "src/util/Common";
import ImageDrawing from "src/routes/QTSX_TITS/SanXuat/TienDoSanXuat/ImageDrawing";
const { EditableRow, EditableCell } = EditableTableRow;

function ModalHoSoChatLuong({ openModalFS, openModal, info }) {
  const dispatch = useDispatch();
  const [ListHangMucKiemTra, setListHangMucKiemTra] = useState([]);

  useEffect(() => {
    if (openModal) {
      getHoSoChatLuong(info);
    }
    return () => {
      dispatch(fetchReset());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  const getHoSoChatLuong = (info) => {
    const param = convertObjectToUrlParams({
      tits_qtsx_SoLoChiTiet_Id: info.tits_qtsx_SoLoChiTiet_Id,
    });
    new Promise((resolve, reject) => {
      dispatch(
        fetchStart(
          `tits_qtsx_TienDoSanXuat/ho-so-kiem-soat-chat-luong?${param}`,
          "GET",
          null,
          "DETAIL",
          "",
          resolve,
          reject
        )
      );
    }).then((res) => {
      if (res && res.data) {
        res.data.list_HoSoCongDoans.forEach((t) => {
          t.list_HoSoCongDoanTieuDePhus.forEach((kscl) => {
            kscl.list_HoSoCongDoanChiTiets.forEach((ctcl) => {
              if (ctcl.list_HoSoCongDoanChiTietLois.length > 0) {
                ctcl.list_HoSoCongDoanChiTietLois.forEach((Ctl) => {
                  t.list_HinhAnhs.forEach((ha) => {
                    if (
                      Ctl.tits_qtsx_SanPhamHinhAnh_Id ===
                      ha.tits_qtsx_SanPhamHinhAnh_Id
                    ) {
                      if (ha.listViTri) {
                        const viTriLoi = JSON.parse(Ctl.viTri);
                        viTriLoi.isHoanThanhSCL = Ctl.isHoanThanhSCL;
                        ha.listViTri.push(JSON.stringify(viTriLoi));
                      } else {
                        const viTriLoi = JSON.parse(Ctl.viTri);
                        viTriLoi.isHoanThanhSCL = Ctl.isHoanThanhSCL;
                        ha.listViTri = [JSON.stringify(viTriLoi)];
                      }
                    }
                  });
                });
              }
            });
          });
        });
        setListHangMucKiemTra(res.data.list_HoSoCongDoans);
      } else {
        setListHangMucKiemTra([]);
      }
    });
  };
  let renderNoiDung = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Trạm",
      dataIndex: "tenTram",
      key: "tenTram",
      align: "center",
    },
    {
      title: "Nội dung",
      dataIndex: "noiDungKiemTra",
      key: "noiDungKiemTra",
      align: "center",
    },
    {
      title: "Tiêu chuẩn đánh giá",
      dataIndex: "tieuChuanDanhGia",
      key: "tieuChuanDanhGia",
      align: "center",
    },
    {
      title: "Giá trị tiêu chuẩn",
      dataIndex: "giaTriTieuChuan",
      key: "giaTriTieuChuan",
      align: "center",
    },
    {
      title: "Đánh giá",
      dataIndex: "isDat",
      key: "isDat",
      align: "center",
      render: (val) => (
        <Tag color={val ? "green" : "red"}>{val ? "Đạt" : "Không đạt"} </Tag>
      ),
    },
    {
      title: "Lỗi",
      dataIndex: "list_HoSoCongDoanChiTietLois",
      key: "list_HoSoCongDoanChiTietLois",
      align: "center",
      render: (val) =>
        val.map((l) => {
          return <Tag color="green">{JSON.parse(l.viTri).maLoi}</Tag>;
        }),
    },
  ];
  let renderThongSo = [
    {
      title: "STT",
      dataIndex: "key",
      key: "key",
      align: "center",
      width: 50,
    },
    {
      title: "Trạm",
      dataIndex: "tenTram",
      key: "tenTram",
      align: "center",
    },
    {
      title: "Nội dung",
      dataIndex: "noiDungKiemTra",
      key: "noiDungKiemTra",
      align: "center",
    },
    {
      title: "Giá trị MIN",
      dataIndex: "giaTriMin",
      key: "giaTriMin",
      align: "center",
    },
    {
      title: "Giá trị MAX",
      dataIndex: "giaTriMax",
      key: "giaTriMax",
      align: "center",
    },
    {
      title: "Kết quả",
      dataIndex: "ketQua",
      key: "ketQua",
      align: "center",
    },
    {
      title: "Đánh giá",
      dataIndex: "isDat",
      key: "isDat",
      align: "center",
      render: (val) => (
        <Tag color={val ? "green" : "red"}>{val ? "Đạt" : "Không đạt"} </Tag>
      ),
    },
    {
      title: "Lỗi",
      dataIndex: "list_HoSoCongDoanChiTietLois",
      key: "list_HoSoCongDoanChiTietLois",
      align: "center",
      render: (val) =>
        val.map((l) => {
          return <Tag color="green">{JSON.parse(l.viTri).maLoi}</Tag>;
        }),
    },
  ];
  const columnThongSos = map(renderThongSo, (col) => {
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
  const columnNoiDungs = map(renderNoiDung, (col) => {
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

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const handleCancel = () => {
    openModalFS(false);
  };

  return (
    <AntModal
      title="Hồ sơ kiểm tra chất lượng"
      open={openModal}
      width={`95%`}
      closable={true}
      onCancel={handleCancel}
      footer={null}
      height={"85vh"}
      style={{ overflow: "auto" }}
    >
      <>
        <Row justify={"center"} style={{ marginBottom: 10 }}>
          <Col span={1}></Col>
          <Col span={13}>
            Sản phẩm:{" "}
            <h5 style={{ fontWeight: "bold", display: "inline" }}>
              {info.tenSanPham}
            </h5>
          </Col>
          <Col span={10}>
            Số khung nội bộ:{" "}
            <h5 style={{ fontWeight: "bold", display: "inline" }}>
              {info.maNoiBo}
            </h5>
          </Col>
        </Row>
        <Divider />
      </>
      {ListHangMucKiemTra.length > 0 &&
        ListHangMucKiemTra.map((hmkt, i) => {
          return (
            hmkt.list_HoSoCongDoanTieuDePhus &&
            hmkt.list_HoSoCongDoanTieuDePhus.length > 0 && [
              <Row key={i}>
                <Col span={24}>
                  <h3 style={{ color: "#0469b9", fontWeight: "bold" }}>
                    Công đoạn: {hmkt.tenCongDoan}
                  </h3>
                </Col>
              </Row>,
              <>
                <Row>
                  <Col
                    span={12}
                    style={{
                      position: "relative",
                      height: 301,
                      overflow: "auto",
                    }}
                  >
                    <Col
                      span={24}
                      style={{
                        marginBottom: 10,
                      }}
                    >
                      <span style={{ marginBottom: 10, display: "block" }}>
                        Hạng mục kiểm tra:{" "}
                        <span style={{ fontWeight: "bold" }}>
                          {hmkt.tenHangMucKiemTra}
                        </span>
                      </span>
                      {hmkt.list_HoSoCongDoanTieuDePhus.map((ct, index) => {
                        return (
                          <>
                            {ct.tieuDePhu && (
                              <span
                                style={{
                                  marginTop: 10,
                                  marginBottom: 10,
                                  display: "block",
                                }}
                              >
                                Hạng mục:{" "}
                                <span style={{ fontWeight: "bold" }}>
                                  {ct.tieuDePhu}
                                </span>
                              </span>
                            )}
                            <Table
                              key={index}
                              bordered
                              scroll={{ x: 800, y: 301 }}
                              columns={
                                hmkt.isNoiDung ? columnNoiDungs : columnThongSos
                              }
                              components={components}
                              className="gx-table-responsive"
                              dataSource={reDataForTable(
                                ct.list_HoSoCongDoanChiTiets
                              )}
                              size="small"
                              pagination={false}
                            />
                          </>
                        );
                      })}
                    </Col>
                  </Col>
                  <Col
                    span={12}
                    align="center"
                    style={{
                      position: "relative",
                      height: 301,
                      overflow: "auto",
                    }}
                  >
                    {hmkt.list_HinhAnhs &&
                      hmkt.list_HinhAnhs.length > 0 &&
                      hmkt.list_HinhAnhs.map((ha) => {
                        return (
                          <ImageDrawing
                            key={ha.tits_qtsx_SanPhamHinhAnh_Id}
                            imageUrl={BASE_URL_API + ha.hinhAnh}
                            hinhAnhId={ha.tits_qtsx_SanPhamHinhAnh_Id}
                            dataNoiDung={hmkt}
                            setListHangMucKiemTra={setListHangMucKiemTra}
                            listViTri={ha.listViTri}
                          />
                        );
                      })}
                  </Col>
                </Row>
                <Divider />
              </>,
            ]
          );
        })}
    </AntModal>
  );
}

export default ModalHoSoChatLuong;
